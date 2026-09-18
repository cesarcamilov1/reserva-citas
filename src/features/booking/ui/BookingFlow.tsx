import { useMemo, useState } from 'react'
import { useAppointmentBooking } from '../application/useAppointmentBooking'
import { useAvailability } from '../application/useAvailability'
import { useBookingFlow } from '../application/useBookingFlow'
import { useLocationServices } from '../application/useLocationServices'
import { useLocations } from '../application/useLocations'
import { describeBookingError } from '../application/errors'
import { newIdempotencyKey } from '../application/ports/PublicBookingGateway'
import type { PublicAppointment, PublicBookingGateway } from '../application/ports/PublicBookingGateway'
import {
  MAX_MONTH_OFFSET,
  buildDaySlots,
  buildMonthGrid,
  dayKey,
  formatLocalTime,
  longDate,
  monthLabel,
  shortDateParts,
} from '../domain/availability'
import { formatAppointmentStatus, formatDurationMinutes, formatPriceMXN } from '../domain/formatting'
import { normalizePhoneToE164 } from '../domain/validation'
import { buildWhatsappMessage } from '../domain/whatsapp'
import { DoctorHeader } from './organisms/DoctorHeader'
import { SummaryRail } from './organisms/SummaryRail'
import { Stepper } from './organisms/Stepper'
import { StepClinic } from './organisms/StepClinic'
import { StepService } from './organisms/StepService'
import { StepSchedule } from './organisms/StepSchedule'
import { StepPatient } from './organisms/StepPatient'
import { StepConfirm } from './organisms/StepConfirm'
import { StepDone } from './organisms/StepDone'
import { Footer } from './organisms/Footer'
import styles from './BookingFlow.module.css'

function capitalize(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text
}

interface BookingFlowProps {
  gateway: PublicBookingGateway
  providerUserId: string
  /** Injectable clock, defaulting to the real current date. Tests can pass a fixed value. */
  now?: Date
}

export function BookingFlow({ gateway, providerUserId, now }: BookingFlowProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const resolvedNow = useMemo(() => now ?? new Date(), [now])
  const { state, actions, isCurrentStepValid } = useBookingFlow()
  const booking = useAppointmentBooking(gateway)

  const [otpCode, setOtpCode] = useState('')
  const [appointment, setAppointment] = useState<PublicAppointment | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  const locationsQuery = useLocations(gateway, providerUserId)
  const servicesQuery = useLocationServices(gateway, providerUserId, state.clinicId)
  const availabilityQuery = useAvailability(gateway, {
    providerUserId,
    serviceId: state.serviceId,
    locationId: state.clinicId,
    monthOffset: state.monthOffset,
    now: resolvedNow,
  })

  const clinic = locationsQuery.locations.find((location) => location.id === state.clinicId) ?? null
  const service = servicesQuery.services.find((item) => item.id === state.serviceId) ?? null

  const cells = buildMonthGrid(state.monthOffset, resolvedNow, availabilityQuery.openDayKeys, state.day)
  const daySlots = availabilityQuery.slots.filter((slot) => dayKey(new Date(slot.startsAt)) === state.day)
  const { morning, afternoon } = buildDaySlots(daySlots, state.slotStartsAt)
  const fecha = longDate(state.day)
  const endTimeLabel = state.slotEndsAt ? formatLocalTime(state.slotEndsAt) : ''
  const shortParts = shortDateParts(state.day)

  const phoneE164 = normalizePhoneToE164(state.patient.phone) ?? ''
  const patientName = `${state.patient.firstName} ${state.patient.lastName}`.trim()
  const phoneDisplay = phoneE164 || state.patient.phone

  const waText = buildWhatsappMessage({
    firstName: state.patient.firstName,
    serviceName: service?.name ?? '',
    longDate: fecha,
    time: state.time,
    clinicName: clinic?.name ?? '',
    clinicAddress: clinic?.address ?? '',
  })

  const summary = {
    clinic: {
      title: clinic ? clinic.name : 'Sede sin elegir',
      subtitle: clinic ? clinic.address : 'Paso 1',
      active: Boolean(clinic),
    },
    service: {
      title: service ? service.name : 'Servicio sin elegir',
      subtitle: service
        ? `${formatDurationMinutes(service.durationMinutes)} · ${formatPriceMXN(service.defaultPrice)}`
        : 'Paso 2',
      active: Boolean(service),
    },
    when: {
      title: fecha && state.time ? capitalize(fecha) : 'Horario sin elegir',
      subtitle: fecha && state.time ? `${state.time} h · GMT-6` : 'Paso 3',
      active: Boolean(fecha && state.time),
    },
  }

  const resumenRows = [
    {
      label: 'Servicio',
      value: service ? service.name : 'Sin definir',
      meta: service ? `Con la Dra. Mariana Cázares · ${formatDurationMinutes(service.durationMinutes)}` : '',
      onEdit: () => actions.goToStep(1),
    },
    {
      label: 'Sede',
      value: clinic ? clinic.name : 'Sin definir',
      meta: clinic ? clinic.address : '',
      onEdit: () => actions.goToStep(0),
    },
    {
      label: 'Paciente',
      value: patientName || 'Sin definir',
      meta: '',
      onEdit: () => actions.goToStep(3),
    },
    {
      label: 'Contacto',
      value: phoneDisplay || 'Sin definir',
      meta:
        (state.patient.email ? `${state.patient.email} · ` : '') +
        (state.wantsWhatsapp ? 'Confirmación y recordatorio por WhatsApp' : 'Sin aviso por WhatsApp'),
      onEdit: () => actions.goToStep(3),
    },
  ]
  if (state.patient.notes) {
    resumenRows.push({ label: 'Motivo', value: state.patient.notes, meta: '', onEdit: () => actions.goToStep(3) })
  }

  const blockedHints = ['', '', state.day && !state.time ? 'Falta elegir la hora' : '', '', 'Al confirmar aceptas el aviso de privacidad']

  async function handleFinalConfirm() {
    if (booking.state.phase === 'idle') {
      await booking.requestCode(phoneE164)
      return
    }
    if (booking.state.phase === 'otpSent') {
      const result = await booking.confirmCode(otpCode, {
        firstName: state.patient.firstName,
        lastName: state.patient.lastName,
        email: state.patient.email || undefined,
        providerUserId,
        locationId: state.clinicId || undefined,
        serviceId: state.serviceId,
        startsAt: state.slotStartsAt,
        reason: state.patient.notes || undefined,
      })
      if (result.ok) {
        setAppointment(result.appointment)
        setOtpCode('')
        actions.next()
      } else if (result.reason === 'slotConflict') {
        actions.clearSchedule()
        availabilityQuery.retry()
        setOtpCode('')
      }
    }
  }

  const step4Phase = booking.state.phase
  const nextLabelByStep4Phase: Record<typeof step4Phase, string> = {
    idle: 'Confirmar cita',
    sendingOtp: 'Enviando código…',
    otpSent: 'Verificar y confirmar',
    verifying: 'Verificando…',
    done: 'Confirmar cita',
  }
  const step4Disabled =
    step4Phase === 'idle'
      ? !phoneE164
      : step4Phase === 'otpSent'
        ? otpCode.length !== 6
        : true

  function handleReset() {
    actions.reset()
    booking.reset()
    setOtpCode('')
    setAppointment(null)
    setCancelError(null)
  }

  async function handleCancel() {
    if (!appointment) return
    setCancelling(true)
    setCancelError(null)
    try {
      const updated = await gateway.cancelAppointment(appointment.publicRef, newIdempotencyKey())
      setAppointment(updated)
    } catch (cause) {
      setCancelError(describeBookingError(cause))
    } finally {
      setCancelling(false)
    }
  }

  const doneLine = `Te esperamos ${fecha || 'el día elegido'} a las ${state.time || '00:00'} h en ${
    clinic ? clinic.name : 'el consultorio'
  }. ${state.wantsWhatsapp ? 'El mensaje de confirmación ya va en camino.' : 'Guarda tu referencia para cualquier cambio.'}`

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.rail}>
          <DoctorHeader />
          <SummaryRail summary={summary} />
        </div>

        <div className={styles.main}>
          <Stepper step={state.step} reached={state.reached} done={state.done} onSelectStep={actions.goToStep} />

          <div className={styles.content}>
            {!state.done && state.step === 0 && (
              <StepClinic
                clinicId={state.clinicId}
                locations={locationsQuery.locations}
                loading={locationsQuery.loading}
                error={locationsQuery.error}
                onRetry={locationsQuery.retry}
                onSelectClinic={actions.setClinic}
              />
            )}

            {!state.done && state.step === 1 && (
              <StepService
                serviceId={state.serviceId}
                services={servicesQuery.services}
                loading={servicesQuery.loading}
                error={servicesQuery.error}
                onRetry={servicesQuery.retry}
                onSelectService={actions.setService}
              />
            )}

            {!state.done && state.step === 2 && (
              <StepSchedule
                monthLabel={monthLabel(state.monthOffset, resolvedNow)}
                canGoPrevMonth={state.monthOffset > 0}
                canGoNextMonth={state.monthOffset < MAX_MONTH_OFFSET}
                onPrevMonth={() => actions.setMonthOffset(-1)}
                onNextMonth={() => actions.setMonthOffset(1)}
                cells={cells}
                onSelectDay={actions.setDay}
                hasDay={Boolean(state.day)}
                slotsTitle={state.day ? capitalize(fecha) : 'Horarios disponibles'}
                morningSlots={morning}
                afternoonSlots={afternoon}
                onSelectTime={(slot) => actions.setTime(slot.label, slot.startsAt, slot.endsAt)}
                loading={availabilityQuery.loading}
                error={availabilityQuery.error}
                onRetry={availabilityQuery.retry}
              />
            )}

            {!state.done && state.step === 3 && (
              <StepPatient
                patient={state.patient}
                wantsWhatsapp={state.wantsWhatsapp}
                onChangeField={actions.setPatientField}
                onToggleWhatsapp={actions.toggleWantsWhatsapp}
              />
            )}

            {!state.done && state.step === 4 && (
              <StepConfirm
                ticketDow={shortParts?.weekday ?? '—'}
                ticketDay={shortParts?.day ?? '—'}
                ticketMonth={shortParts?.month ?? ''}
                ticketTitle={fecha ? capitalize(fecha) : 'Fecha sin elegir'}
                ticketMeta={
                  `${state.time ? `${state.time} a ${endTimeLabel} h` : 'Hora sin elegir'}` +
                  (service ? ` · ${formatDurationMinutes(service.durationMinutes)}` : '') +
                  ' · horario del centro de México'
                }
                onEditWhen={() => actions.goToStep(2)}
                rows={resumenRows}
                total={service ? formatPriceMXN(service.defaultPrice) : '—'}
                waText={waText}
                waTime="09:41"
                waPhone={phoneDisplay || 'tu celular'}
                otpPhase={step4Phase}
                otpCode={otpCode}
                onChangeOtpCode={setOtpCode}
                onResendCode={() => booking.resendCode()}
                otpError={booking.state.error}
              />
            )}

            {state.done && appointment && (
              <StepDone
                doneLine={doneLine}
                publicRef={appointment.publicRef}
                statusLabel={formatAppointmentStatus(appointment.status)}
                showMessage={state.showWhatsappPreview}
                onToggleMessage={actions.toggleWhatsappPreview}
                addedToCalendar={state.addedToCalendar}
                onToggleCalendar={actions.toggleAddedToCalendar}
                waText={waText}
                waTime="09:41"
                onReset={handleReset}
                onCancel={handleCancel}
                cancelling={cancelling}
                cancelError={cancelError}
                cancelled={appointment.status === 'CANCELLED'}
              />
            )}
          </div>

          {!state.done && (
            <Footer
              canGoBack={state.step > 0}
              onBack={actions.back}
              hint={blockedHints[state.step]}
              nextLabel={state.step === 4 ? nextLabelByStep4Phase[step4Phase] : NEXT_LABELS[state.step]}
              nextDisabled={state.step === 4 ? step4Disabled : !isCurrentStepValid}
              onNext={state.step === 4 ? handleFinalConfirm : actions.next}
            />
          )}
        </div>
      </div>
    </div>
  )
}

const NEXT_LABELS = ['Continuar', 'Continuar', 'Continuar', 'Revisar mi cita', 'Confirmar cita']
