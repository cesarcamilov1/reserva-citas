import { useBookingFlow } from '../application/useBookingFlow'
import { buildDaySlots, buildMonthGrid, longDate, MAX_MONTH_OFFSET, monthLabel, shortDateParts } from '../domain/availability'
import { addMinutesToTime, buildFolio } from '../domain/appointment'
import { getClinic } from '../domain/clinics'
import { getService } from '../domain/services'
import { isStepValid } from '../domain/validation'
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

const NEXT_LABELS = ['Continuar', 'Continuar', 'Continuar', 'Revisar mi cita', 'Confirmar cita']

export function BookingFlow() {
  const { state, actions } = useBookingFlow()

  const clinic = getClinic(state.clinicId)
  const service = getService(state.serviceId)

  const cells = buildMonthGrid(state.monthOffset, clinic, state.day)
  const { morning, afternoon } = buildDaySlots(state.day, state.time)
  const fecha = longDate(state.day)
  const dayOfMonth = state.day ? Number(state.day.split('-')[2]) : 0
  const endTime = state.time ? addMinutesToTime(state.time, service?.durationMinutes ?? 30) : ''
  const folio = buildFolio(dayOfMonth)
  const shortParts = shortDateParts(state.day)

  const patientName = `${state.patient.firstName} ${state.patient.lastName}`.trim()
  const phoneDisplay = state.patient.phone ? `+52 ${state.patient.phone}` : ''

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
      subtitle: service ? `${service.duration} · ${service.price}` : 'Paso 2',
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
      meta: service ? `Con la Dra. Mariana Cázares · ${service.duration}` : '',
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
      meta: state.patient.birthDate ? `Nacimiento: ${state.patient.birthDate}` : '',
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
  const stepValid = isStepValid(state.step, state)

  const doneLine = `Te esperamos ${fecha || 'el día elegido'} a las ${state.time || '00:00'} h en ${
    clinic ? clinic.name : 'el consultorio'
  }. ${state.wantsWhatsapp ? 'El mensaje de confirmación ya va en camino.' : 'Guarda tu folio para cualquier cambio.'}`

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
              <StepClinic clinicId={state.clinicId} clinic={clinic} onSelectClinic={actions.setClinic} />
            )}

            {!state.done && state.step === 1 && (
              <StepService serviceId={state.serviceId} onSelectService={actions.setService} />
            )}

            {!state.done && state.step === 2 && (
              <StepSchedule
                monthLabel={monthLabel(state.monthOffset)}
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
                onSelectTime={actions.setTime}
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
                  `${state.time ? `${state.time} a ${endTime} h` : 'Hora sin elegir'}` +
                  (service ? ` · ${service.duration}` : '') +
                  ' · horario del centro de México'
                }
                onEditWhen={() => actions.goToStep(2)}
                rows={resumenRows}
                total={service ? service.price : '—'}
                waText={waText}
                waTime="09:41"
                waPhone={phoneDisplay || 'tu celular'}
              />
            )}

            {state.done && (
              <StepDone
                doneLine={doneLine}
                folio={folio}
                showMessage={state.showWhatsappPreview}
                onToggleMessage={actions.toggleWhatsappPreview}
                addedToCalendar={state.addedToCalendar}
                onToggleCalendar={actions.toggleAddedToCalendar}
                waText={waText}
                waTime="09:41"
                onReset={actions.reset}
              />
            )}
          </div>

          {!state.done && (
            <Footer
              canGoBack={state.step > 0}
              onBack={actions.back}
              hint={blockedHints[state.step]}
              nextLabel={NEXT_LABELS[state.step]}
              nextDisabled={!stepValid}
              onNext={actions.next}
            />
          )}
        </div>
      </div>
    </div>
  )
}
