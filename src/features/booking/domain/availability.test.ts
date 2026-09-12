import { describe, expect, it } from 'vitest'
import { CLINICS } from './clinics'
import {
  REFERENCE_TODAY,
  buildMonthGrid,
  dayKey,
  isDayOpen,
  isSlotTaken,
  parseDayKey,
} from './availability'

describe('isDayOpen', () => {
  it('closes on Sundays for every clinic', () => {
    const sunday = new Date(2026, 8, 13) // Sep 13, 2026 is a Sunday
    expect(sunday.getDay()).toBe(0)
    expect(isDayOpen(sunday, CLINICS.roma)).toBe(false)
    expect(isDayOpen(sunday, CLINICS.video)).toBe(false)
  })

  it('opens on Saturdays only for clinics that allow it', () => {
    const saturday = new Date(2026, 8, 19) // Sep 19, 2026 is a Saturday
    expect(saturday.getDay()).toBe(6)
    expect(isDayOpen(saturday, CLINICS.roma)).toBe(true)
    expect(isDayOpen(saturday, CLINICS.video)).toBe(true)
    expect(isDayOpen(saturday, CLINICS.polanco)).toBe(false)
    expect(isDayOpen(saturday, CLINICS.satelite)).toBe(false)
  })

  it('rejects days on or before the reference date', () => {
    expect(isDayOpen(REFERENCE_TODAY, CLINICS.roma)).toBe(false)
    const yesterday = new Date(2026, 8, 10)
    expect(isDayOpen(yesterday, CLINICS.roma)).toBe(false)
  })

  it('rejects the deterministic blocked-day rule (date-of-month mod 7 === 3)', () => {
    const blocked = new Date(2026, 8, 24) // 24 % 7 === 3
    expect(isDayOpen(blocked, CLINICS.roma)).toBe(false)
    const open = new Date(2026, 8, 15) // 15 % 7 === 1, weekday Tuesday
    expect(isDayOpen(open, CLINICS.roma)).toBe(true)
  })
})

describe('isSlotTaken', () => {
  it('matches the deterministic taken-slot formula (dayNum + i*3) % 7 === 1', () => {
    for (let dayNum = 1; dayNum <= 30; dayNum++) {
      for (let i = 0; i < 6; i++) {
        expect(isSlotTaken(dayNum, i)).toBe((dayNum + i * 3) % 7 === 1)
      }
    }
  })
})

describe('dayKey / parseDayKey', () => {
  it('round-trips a date', () => {
    const date = new Date(2026, 9, 22)
    const key = dayKey(date)
    expect(key).toBe('2026-9-22')
    const parsed = parseDayKey(key)
    expect(parsed.getFullYear()).toBe(2026)
    expect(parsed.getMonth()).toBe(9)
    expect(parsed.getDate()).toBe(22)
  })
})

describe('buildMonthGrid', () => {
  it('produces 6 leading blanks plus 30 days for November 2026', () => {
    // November 1, 2026 is a Sunday -> (0 + 6) % 7 = 6 leading blanks
    const cells = buildMonthGrid(2, CLINICS.roma, '') // monthOffset 2 -> Nov 2026
    const blanks = cells.filter((cell) => cell.isBlank)
    const days = cells.filter((cell) => !cell.isBlank)
    expect(blanks).toHaveLength(6)
    expect(days).toHaveLength(30)
  })

  it('marks the selected day', () => {
    const key = dayKey(new Date(2026, 8, 15))
    const cells = buildMonthGrid(0, CLINICS.roma, key)
    const selected = cells.find((cell) => cell.dayKey === key)
    expect(selected?.isSelected).toBe(true)
  })
})
