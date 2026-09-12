import { describe, expect, it } from 'vitest'
import { mixWithBlack, mixWithWhite } from './colorMix'

describe('mixWithWhite', () => {
  it('mixes the accent toward white for the soft/line tokens', () => {
    expect(mixWithWhite('#0F6E62', 0.93)).toBe('#EEF5F4')
    expect(mixWithWhite('#0F6E62', 0.66)).toBe('#ADCECA')
  })

  it('returns the original color at t=0 and white at t=1', () => {
    expect(mixWithWhite('#0F6E62', 0)).toBe('#0F6E62')
    expect(mixWithWhite('#0F6E62', 1)).toBe('#FFFFFF')
  })
})

describe('mixWithBlack', () => {
  it('mixes the accent toward black for readable-on-soft text', () => {
    expect(mixWithBlack('#0F6E62', 0.25)).toBe('#0B534A')
    expect(mixWithBlack('#0F6E62', 0.12)).toBe('#0D6156')
  })

  it('returns the original color at t=0 and black at t=1', () => {
    expect(mixWithBlack('#0F6E62', 0)).toBe('#0F6E62')
    expect(mixWithBlack('#0F6E62', 1)).toBe('#000000')
  })
})
