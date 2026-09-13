import type { BookingState, PatientInfo, StepIndex } from './types'

/**
 * Normalizes a phone number to E.164.
 * Accepts an already-E.164 number, or a 10-digit Mexican number (→ +52XXXXXXXXXX).
 * Returns null when the input can't be normalized.
 */
export function normalizePhoneToE164(phone: string): string | null {
  const trimmed = phone.trim()
  if (/^\+[1-9]\d{7,14}$/.test(trimmed)) {
    return trimmed
  }

  const digits = trimmed.replace(/\D/g, '')
  if (digits.length === 10) {
    return `+52${digits}`
  }
  if (digits.length === 12 && digits.startsWith('52')) {
    return `+${digits}`
  }

  return null
}

export function isValidPhone(phone: string): boolean {
  return normalizePhoneToE164(phone) !== null
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
