import { describe, expect, it } from 'vitest'
import {
  buildDaySlots,
  buildMonthGrid,
  dayKey,
  longDate,
  monthLabel,
  monthRange,
  parseDayKey,
  shortDateParts,
  splitDateRange,
} from './availability'

describe('dayKey / parseDayKey', () => {
  it('round-trips a date as an ISO date', () => {
    const date = new Date(2026, 9, 22)
    const key = dayKey(date)
    expect(key).toBe('2026-10-22')
    const parsed = parseDayKey(key)
    expect(parsed.getFullYear()).toBe(2026)
    expect(parsed.getMonth()).toBe(9)
    expect(parsed.getDate()).toBe(22)
  })

  it('pads single-digit months and days', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('monthRange', () => {
  it('spans the full month when it is entirely in the future', () => {
    const now = new Date(2026, 8, 11) // Sep 11, 2026
    expect(monthRange(1, now)).toEqual({ from: '2026-10-01', to: '2026-10-31' })
  })

  it('clamps the current month to start at today', () => {
    const now = new Date(2026, 8, 11)
    expect(monthRange(0, now)).toEqual({ from: '2026-09-11', to: '2026-09-30' })
  })
})

describe('splitDateRange', () => {
  it('returns a single chunk when the range fits the max span', () => {
    expect(splitDateRange('2026-09-01', '2026-09-30', 31)).toEqual([{ from: '2026-09-01', to: '2026-09-30' }])
  })

  it('splits a wide range into chunks that respect the max span', () => {
    const chunks = splitDateRange('2026-01-01', '2026-03-31', 31)
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks[0].from).toBe('2026-01-01')
    expect(chunks.at(-1)?.to).toBe('2026-03-31')
  })
})

describe('buildMonthGrid', () => {
  it('produces 6 leading blanks plus 30 days for November 2026', () => {
    // November 1, 2026 is a Sunday -> (0 + 6) % 7 = 6 leading blanks
    const now = new Date(2026, 8, 11)
    const cells = buildMonthGrid(2, now, new Set(), '') // monthOffset 2 -> Nov 2026
    const blanks = cells.filter((cell) => cell.isBlank)
    const days = cells.filter((cell) => !cell.isBlank)
    expect(blanks).toHaveLength(6)
    expect(days).toHaveLength(30)
  })

  it('marks a day open only when it is in the open-day set', () => {
    const now = new Date(2026, 8, 11)
    const cells = buildMonthGrid(0, now, new Set(['2026-09-15']), '')
    const open = cells.filter((cell) => cell.isOpen)
    expect(open).toHaveLength(1)
    expect(open[0].dayKey).toBe('2026-09-15')
  })

  it('marks the selected day', () => {
    const now = new Date(2026, 8, 11)
    const key = dayKey(new Date(2026, 8, 15))
    const cells = buildMonthGrid(0, now, new Set([key]), key)
    const selected = cells.find((cell) => cell.dayKey === key)
    expect(selected?.isSelected).toBe(true)
  })
})

describe('buildDaySlots', () => {
  it('splits slots into morning/afternoon local buckets, sorted and formatted', () => {
    const { morning, afternoon } = buildDaySlots(
      [
        { startsAt: '2026-09-15T16:30:00Z', endsAt: '2026-09-15T17:00:00Z' }, // 10:30 local (UTC-6)
        { startsAt: '2026-09-15T14:00:00Z', endsAt: '2026-09-15T14:30:00Z' }, // 08:00 local
        { startsAt: '2026-09-15T21:00:00Z', endsAt: '2026-09-15T21:30:00Z' }, // 15:00 local
      ],
      '',
    )

    expect(morning.map((slot) => slot.label)).toEqual(['08:00', '10:30'])
    expect(afternoon.map((slot) => slot.label)).toEqual(['15:00'])
  })

  it('marks the selected slot by matching startsAt', () => {
    const { morning } = buildDaySlots(
      [{ startsAt: '2026-09-15T14:00:00Z', endsAt: '2026-09-15T14:30:00Z' }],
      '2026-09-15T14:00:00Z',
    )
    expect(morning[0].selected).toBe(true)
  })
})

describe('longDate', () => {
  it('returns empty string for an empty key', () => {
    expect(longDate('')).toBe('')
  })

  it('formats a weekday and month name', () => {
    expect(longDate('2026-09-15')).toBe('martes 15 de septiembre')
  })
})

describe('shortDateParts', () => {
  it('returns null for an empty key', () => {
    expect(shortDateParts('')).toBeNull()
  })

  it('returns short weekday/day/month parts', () => {
    expect(shortDateParts('2026-09-15')).toEqual({ weekday: 'mar', day: '15', month: 'sep' })
  })
})

describe('monthLabel', () => {
  it('capitalizes the month name and includes the year', () => {
    const now = new Date(2026, 8, 11)
    expect(monthLabel(0, now)).toBe('Septiembre 2026')
    expect(monthLabel(2, now)).toBe('Noviembre 2026')
  })
})
