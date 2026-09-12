export type ClinicId = 'polanco' | 'roma' | 'satelite' | 'video'

export interface Clinic {
  id: ClinicId
  name: string
  address: string
  meta: string
  /** Whether this clinic opens on Saturdays. */
  openOnSaturday: boolean
}

export type ServiceId = 'primera' | 'seguimiento' | 'certificado' | 'nutricion'

export interface Service {
  id: ServiceId
  name: string
  description: string
  price: string
  /** Human readable duration, e.g. "45 min". */
  duration: string
  /** Duration in minutes, parsed from `duration`. */
  durationMinutes: number
}

export interface CalendarCell {
  /** Day-of-month label, empty string for a leading blank cell. */
  label: string
  /** ISO-ish day key "YYYY-M-D", empty for a blank cell. */
  dayKey: string
  isBlank: boolean
  isOpen: boolean
  isSelected: boolean
}

export interface TimeSlot {
  label: string
  taken: boolean
  selected: boolean
}

export interface PatientInfo {
  firstName: string
  lastName: string
  phone: string
  birthDate: string
  email: string
  notes: string
}

export type StepIndex = 0 | 1 | 2 | 3 | 4

export interface BookingState {
  step: StepIndex
  reached: StepIndex
  done: boolean
  clinicId: ClinicId | ''
  serviceId: ServiceId | ''
  monthOffset: number
  day: string
  time: string
  patient: PatientInfo
  wantsWhatsapp: boolean
  showWhatsappPreview: boolean
  addedToCalendar: boolean
}
