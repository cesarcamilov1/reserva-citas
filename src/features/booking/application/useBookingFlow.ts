import { useMemo, useState } from 'react'
import { MAX_MONTH_OFFSET } from '../domain/availability'
import { isStepValid } from '../domain/validation'
import type { BookingState, ClinicId, PatientInfo, ServiceId, StepIndex } from '../domain/types'

const INITIAL_PATIENT: PatientInfo = {
  firstName: '',
  lastName: '',
  phone: '',
  birthDate: '',
  email: '',
  notes: '',
}

const INITIAL_STATE: BookingState = {
  step: 0,
  reached: 0,
  done: false,
  clinicId: '',
  serviceId: '',
  monthOffset: 0,
  day: '',
  time: '',
  patient: INITIAL_PATIENT,
  wantsWhatsapp: true,
  showWhatsappPreview: false,
  addedToCalendar: false,
}

export interface BookingFlowActions {
  setClinic: (clinicId: ClinicId) => void
  setService: (serviceId: ServiceId) => void
  setMonthOffset: (delta: number) => void
  setDay: (day: string) => void
  setTime: (time: string) => void
  setPatientField: <K extends keyof PatientInfo>(field: K, value: PatientInfo[K]) => void
  toggleWantsWhatsapp: () => void
  toggleWhatsappPreview: () => void
  toggleAddedToCalendar: () => void
  goToStep: (step: StepIndex) => void
  next: () => void
  back: () => void
  reset: () => void
}

export interface UseBookingFlowResult {
  state: BookingState
  actions: BookingFlowActions
  isCurrentStepValid: boolean
}

export function useBookingFlow(): UseBookingFlowResult {
  const [state, setState] = useState<BookingState>(INITIAL_STATE)

  const actions = useMemo<BookingFlowActions>(
    () => ({
      setClinic: (clinicId) =>
        setState((prev) => ({ ...prev, clinicId, day: '', time: '' })),

      setService: (serviceId) => setState((prev) => ({ ...prev, serviceId })),

      setMonthOffset: (delta) =>
        setState((prev) => {
          const next = prev.monthOffset + delta
          if (next < 0 || next > MAX_MONTH_OFFSET) return prev
          return { ...prev, monthOffset: next }
        }),

      setDay: (day) => setState((prev) => ({ ...prev, day, time: '' })),

      setTime: (time) => setState((prev) => ({ ...prev, time })),

      setPatientField: (field, value) =>
        setState((prev) => ({ ...prev, patient: { ...prev.patient, [field]: value } })),

      toggleWantsWhatsapp: () =>
        setState((prev) => ({ ...prev, wantsWhatsapp: !prev.wantsWhatsapp })),

      toggleWhatsappPreview: () =>
        setState((prev) => ({ ...prev, showWhatsappPreview: !prev.showWhatsappPreview })),

      toggleAddedToCalendar: () =>
        setState((prev) => ({ ...prev, addedToCalendar: !prev.addedToCalendar })),

      goToStep: (step) =>
        setState((prev) => {
          if (step > prev.reached) return prev
          return { ...prev, step, done: false }
        }),

      next: () =>
        setState((prev) => {
          if (!isStepValid(prev.step, prev)) return prev
          if (prev.step === 4) {
            return { ...prev, done: true }
          }
          const nextStep = (prev.step + 1) as StepIndex
          return { ...prev, step: nextStep, reached: Math.max(prev.reached, nextStep) as StepIndex }
        }),

      back: () =>
        setState((prev) => {
          if (prev.step === 0) return prev
          return { ...prev, step: (prev.step - 1) as StepIndex, done: false }
        }),

      reset: () => setState(INITIAL_STATE),
    }),
    [],
  )

  const isCurrentStepValid = isStepValid(state.step, state)

  return { state, actions, isCurrentStepValid }
}
