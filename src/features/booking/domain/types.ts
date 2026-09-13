export interface CalendarCell {
  /** Day-of-month label, empty string for a leading blank cell. */
  label: string
  /** ISO date "YYYY-MM-DD", empty for a blank cell. */
  dayKey: string
  isBlank: boolean
  isOpen: boolean
  isSelected: boolean
}

export interface TimeSlot {
  /** Local time "HH:mm". */
  label: string
  /** ISO instant this slot starts at. */
  startsAt: string
  /** ISO instant this slot ends at. */
  endsAt: string
  selected: boolean
}

export interface PatientInfo {
  firstName: string
  lastName: string
  phone: string
  email: string
  notes: string
}

export type StepIndex = 0 | 1 | 2 | 3 | 4

export interface BookingState {
  step: StepIndex
  reached: StepIndex
  done: boolean
  clinicId: string
  serviceId: string
  monthOffset: number
  day: string
  time: string
  slotStartsAt: string
  slotEndsAt: string
  patient: PatientInfo
  wantsWhatsapp: boolean
  showWhatsappPreview: boolean
  addedToCalendar: boolean
}
