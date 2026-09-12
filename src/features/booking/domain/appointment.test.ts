import { describe, expect, it } from 'vitest'
import { addMinutesToTime, buildFolio } from './appointment'

describe('addMinutesToTime', () => {
  it('adds a duration that crosses the hour', () => {
    expect(addMinutesToTime('10:15', 45)).toBe('11:00')
  })

  it('adds a duration that stays within the hour', () => {
    expect(addMinutesToTime('08:00', 25)).toBe('08:25')
  })

  it('wraps around midnight', () => {
    expect(addMinutesToTime('23:45', 30)).toBe('00:15')
  })
})

describe('buildFolio', () => {
  it('is deterministic for a given day of month', () => {
    expect(buildFolio(22)).toBe('MX-26-1554')
    expect(buildFolio(0)).toBe('MX-26-1400')
  })
})
