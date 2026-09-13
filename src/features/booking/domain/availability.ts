import type { AvailabilitySlot } from '../application/ports/PublicBookingGateway'
import type { CalendarCell, TimeSlot } from './types'

/** Maximum month offset selectable from the current month (inclusive). */
export const MAX_MONTH_OFFSET = 2

/** The backend's maximum `to - from` span for a single availability request. */
export const AVAILABILITY_MAX_SPAN_DAYS = 31

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Splits an inclusive [from, to] ISO date range into chunks that each stay
 * within the backend's maximum span, so a wide range can be fetched as
 * multiple availability requests.
 */
export function splitDateRange(
  from: string,
  to: string,
  maxSpanDays: number = AVAILABILITY_MAX_SPAN_DAYS,
): Array<{ from: string; to: string }> {
  const rangeEnd = parseDayKey(to)
  const ranges: Array<{ from: string; to: string }> = []
  let chunkStart = parseDayKey(from)

  while (chunkStart <= rangeEnd) {
    const chunkEnd = new Date(chunkStart)
    chunkEnd.setDate(chunkEnd.getDate() + maxSpanDays)

    if (chunkEnd >= rangeEnd) {
      ranges.push({ from: dayKey(chunkStart), to: dayKey(rangeEnd) })
      break
    }

    ranges.push({ from: dayKey(chunkStart), to: dayKey(chunkEnd) })
    chunkStart = new Date(chunkEnd)
    chunkStart.setDate(chunkStart.getDate() + 1)
  }

  return ranges
}

/**
 * The visible [from, to] range for `monthOffset` months after `now`,
 * clamped so it never starts before today.
 */
export function monthRange(monthOffset: number, now: Date): { from: string; to: string } {
  const view = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const monthStart = new Date(view.getFullYear(), view.getMonth(), 1)
  const monthEnd = new Date(view.getFullYear(), view.getMonth() + 1, 0)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const from = monthStart < today ? today : monthStart
  return { from: dayKey(from), to: dayKey(monthEnd) }
}

/**
 * Builds the calendar grid for `monthOffset` months after `now`, including
 * leading blank cells so the grid always starts on Monday. A day is open
 * when `openDayKeys` contains it (i.e. it has at least one available slot).
 */
export function buildMonthGrid(
  monthOffset: number,
  now: Date,
  openDayKeys: ReadonlySet<string>,
  selectedDayKey: string,
): CalendarCell[] {
  const view = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
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
      isOpen: openDayKeys.has(key),
      isSelected: key === selectedDayKey,
    })
  }
  return cells
}

export function monthLabel(monthOffset: number, now: Date): string {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  const view = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const name = months[view.getMonth()]
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${view.getFullYear()}`
}

export function formatLocalTime(iso: string): string {
  const date = new Date(iso)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Splits a day's slots into morning/afternoon local-time buckets, sorted chronologically. */
export function buildDaySlots(
  slots: AvailabilitySlot[],
  selectedStartsAt: string,
): { morning: TimeSlot[]; afternoon: TimeSlot[] } {
  const sorted = [...slots].sort((a, b) => a.startsAt.localeCompare(b.startsAt))

  const toTimeSlot = (slot: AvailabilitySlot): TimeSlot => ({
    label: formatLocalTime(slot.startsAt),
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    selected: slot.startsAt === selectedStartsAt,
  })

  const morning = sorted.filter((slot) => new Date(slot.startsAt).getHours() < 12).map(toTimeSlot)
  const afternoon = sorted.filter((slot) => new Date(slot.startsAt).getHours() >= 12).map(toTimeSlot)

  return { morning, afternoon }
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
