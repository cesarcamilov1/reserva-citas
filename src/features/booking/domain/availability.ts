import type { CalendarCell, Clinic } from './types'

/** Fixed "today" the whole booking flow is anchored to. */
export const REFERENCE_TODAY = new Date(2026, 8, 11)

/** Maximum month offset selectable from the reference month (inclusive). */
export const MAX_MONTH_OFFSET = 2

export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month, day)
}

/**
 * A day is open when: it isn't Sunday, it isn't Saturday unless the clinic
 * allows Saturdays, it is strictly after the reference "today", and it
 * doesn't fall on the deterministic blocked-day rule used by the design
 * (day-of-month mod 7 === 3).
 */
export function isDayOpen(date: Date, clinic: Clinic | null): boolean {
  const dow = date.getDay()
  if (dow === 0) return false
  if (dow === 6 && !(clinic && clinic.openOnSaturday)) return false
  if (date.getTime() <= REFERENCE_TODAY.getTime()) return false
  if (date.getDate() % 7 === 3) return false
  return true
}

/** Deterministic "already booked" rule for a given day-of-month and slot index. */
export function isSlotTaken(dayOfMonth: number, slotIndex: number): boolean {
  return (dayOfMonth + slotIndex * 3) % 7 === 1
}

/**
 * Builds the calendar grid for `monthOffset` months after the reference
 * month, including leading blank cells so the grid always starts on Monday.
 */
export function buildMonthGrid(
  monthOffset: number,
  clinic: Clinic | null,
  selectedDayKey: string,
): CalendarCell[] {
  const view = new Date(REFERENCE_TODAY.getFullYear(), REFERENCE_TODAY.getMonth() + monthOffset, 1)
  const firstDow = (view.getDay() + 6) % 7
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()

  const cells: CalendarCell[] = []
  for (let blank = 0; blank < firstDow; blank++) {
    cells.push({ label: '', dayKey: '', isBlank: true, isOpen: false, isSelected: false })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(view.getFullYear(), view.getMonth(), day)
    const key = dayKey(date)
    cells.push({
      label: String(day),
      dayKey: key,
      isBlank: false,
      isOpen: isDayOpen(date, clinic),
      isSelected: key === selectedDayKey,
    })
  }
  return cells
}

export function monthLabel(monthOffset: number): string {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  const view = new Date(REFERENCE_TODAY.getFullYear(), REFERENCE_TODAY.getMonth() + monthOffset, 1)
  const name = months[view.getMonth()]
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${view.getFullYear()}`
}

const MORNING_TIMES = ['08:00', '08:45', '09:30', '10:15', '11:00', '11:45']
const AFTERNOON_TIMES = ['15:00', '15:45', '16:30', '17:15', '18:00', '18:45']

export function buildDaySlots(dayKeyValue: string, selectedTime: string) {
  const dayOfMonth = dayKeyValue ? parseDayKey(dayKeyValue).getDate() : 0
  const build = (times: string[], offset: number) =>
    times.map((label, index) => ({
      label,
      taken: isSlotTaken(dayOfMonth, index + offset),
      selected: label === selectedTime,
    }))
  return {
    morning: build(MORNING_TIMES, 0),
    afternoon: build(AFTERNOON_TIMES, 6),
  }
}

const WEEKDAYS_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MONTHS_LONG = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export function longDate(key: string): string {
  if (!key) return ''
  const date = parseDayKey(key)
  return `${WEEKDAYS_LONG[date.getDay()]} ${date.getDate()} de ${MONTHS_LONG[date.getMonth()]}`
}

const WEEKDAYS_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export interface ShortDateParts {
  weekday: string
  day: string
  month: string
}

/** Short weekday/day/month parts used by the confirm step's ticket badge. */
export function shortDateParts(key: string): ShortDateParts | null {
  if (!key) return null
  const date = parseDayKey(key)
  return {
    weekday: WEEKDAYS_SHORT[date.getDay()],
    day: String(date.getDate()),
    month: MONTHS_SHORT[date.getMonth()],
  }
}
