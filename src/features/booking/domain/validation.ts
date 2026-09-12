import type { BookingState, PatientInfo, StepIndex } from './types'

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10
}

export function isPatientStepValid(patient: PatientInfo): boolean {
  return Boolean(patient.firstName && patient.lastName && isValidPhone(patient.phone))
}

export function isStepValid(step: StepIndex, state: BookingState): boolean {
  switch (step) {
    case 0:
      return Boolean(state.clinicId)
    case 1:
      return Boolean(state.serviceId)
    case 2:
      return Boolean(state.day && state.time)
    case 3:
      return isPatientStepValid(state.patient)
    case 4:
      return true
    default:
      return false
  }
}
