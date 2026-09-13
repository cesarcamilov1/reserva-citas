import { describe, expect, it } from 'vitest'
import { ApiError } from '../infrastructure/http/ApiError'
import { describeBookingError, describeLoadError, isSlotConflict } from './errors'

function apiError(status: number, code: string): ApiError {
  return new ApiError({ status, code })
}

describe('describeLoadError', () => {
  it('gives a network-specific message for status 0', () => {
    expect(describeLoadError(apiError(0, 'NETWORK_ERROR'))).toMatch(/conectar/)
  })

  it('gives a rate-limit message for 429', () => {
    expect(describeLoadError(apiError(429, 'RATE_LIMITED'))).toMatch(/demasiadas/)
  })

  it('gives an unavailable message for 503', () => {
    expect(describeLoadError(apiError(503, 'AUTH_UNAVAILABLE'))).toMatch(/no está disponible/)
  })

  it('falls back to a generic message for anything else', () => {
    expect(describeLoadError(apiError(500, 'UNKNOWN_ERROR'))).toBe('No pudimos cargar la información. Intenta de nuevo.')
    expect(describeLoadError(new Error('boom'))).toBe('No pudimos cargar la información. Intenta de nuevo.')
  })
})

describe('describeBookingError', () => {
  it('maps 401 to an invalid/expired code message', () => {
    expect(describeBookingError(apiError(401, 'INVALID_CHALLENGE'))).toMatch(/código/)
  })

  it('maps 429 to a rate-limit message', () => {
    expect(describeBookingError(apiError(429, 'RATE_LIMITED'))).toMatch(/intentos/)
  })

  it('maps 409 to a slot-taken message', () => {
    expect(describeBookingError(apiError(409, 'SLOT_CONFLICT'))).toMatch(/horario/)
  })

  it('maps 503 to a service-unavailable message', () => {
    expect(describeBookingError(apiError(503, 'AUTH_UNAVAILABLE'))).toMatch(/no está disponible/)
  })

  it('maps status 0 to a network message', () => {
    expect(describeBookingError(apiError(0, 'NETWORK_ERROR'))).toMatch(/conectar/)
  })

  it('falls back to a generic message for anything else', () => {
    expect(describeBookingError(apiError(400, 'INVALID_REQUEST'))).toBe('Ocurrió un error al procesar tu solicitud. Intenta de nuevo.')
    expect(describeBookingError(new Error('boom'))).toBe('Ocurrió un error inesperado. Intenta de nuevo.')
  })
})

describe('isSlotConflict', () => {
  it('is true only for a 409 ApiError', () => {
    expect(isSlotConflict(apiError(409, 'SLOT_CONFLICT'))).toBe(true)
    expect(isSlotConflict(apiError(400, 'INVALID_REQUEST'))).toBe(false)
    expect(isSlotConflict(new Error('boom'))).toBe(false)
  })
})
