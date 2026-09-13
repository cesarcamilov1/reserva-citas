import { describe, expect, it } from 'vitest'
import { formatAppointmentStatus, formatDurationMinutes, formatPriceMXN } from './formatting'

describe('formatPriceMXN', () => {
  it('formats a decimal price string as MXN currency', () => {
    expect(formatPriceMXN('450.00')).toBe('$450.00')
    expect(formatPriceMXN('1234.50')).toBe('$1,234.50')
  })
})

describe('formatDurationMinutes', () => {
  it('formats minutes as a short label', () => {
    expect(formatDurationMinutes(45)).toBe('45 min')
  })
})

describe('formatAppointmentStatus', () => {
  it('translates known statuses to Spanish', () => {
    expect(formatAppointmentStatus('PENDING')).toBe('Pendiente')
    expect(formatAppointmentStatus('CONFIRMED')).toBe('Confirmada')
    expect(formatAppointmentStatus('CANCELLED')).toBe('Cancelada')
  })

  it('falls back to the raw status for an unknown value', () => {
    expect(formatAppointmentStatus('WEIRD')).toBe('WEIRD')
  })
})
