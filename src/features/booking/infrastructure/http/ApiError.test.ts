import { describe, expect, it } from 'vitest'
import { ApiError } from './ApiError'

describe('ApiError.fromResponse', () => {
  it('builds a field-level error from a 400 problem+json body', async () => {
    const response = new Response(
      JSON.stringify({
        type: 'about:blank',
        title: 'Invalid request',
        status: 400,
        code: 'INVALID_REQUEST',
        detail: 'phone_e164 is invalid',
        request_id: 'req-1',
        errors: [{ field: 'phone_e164', code: 'PATTERN', message: 'must be E.164' }],
      }),
      { status: 400, headers: { 'Content-Type': 'application/problem+json' } },
    )

    const error = await ApiError.fromResponse(response)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(400)
    expect(error.code).toBe('INVALID_REQUEST')
    expect(error.detail).toBe('phone_e164 is invalid')
    expect(error.requestId).toBe('req-1')
    expect(error.fieldErrors).toEqual([{ field: 'phone_e164', code: 'PATTERN', message: 'must be E.164' }])
  })

  it('falls back gracefully on a 409 with an empty body', async () => {
    const response = new Response(null, { status: 409 })

    const error = await ApiError.fromResponse(response)

    expect(error.status).toBe(409)
    expect(error.code).toBe('UNKNOWN_ERROR')
    expect(error.fieldErrors).toBeUndefined()
  })

  it('builds a 429 rate-limited error from problem+json', async () => {
    const response = new Response(
      JSON.stringify({
        type: 'about:blank',
        title: 'Too many requests',
        status: 429,
        code: 'RATE_LIMITED',
        detail: 'Retry later',
        request_id: 'req-2',
      }),
      { status: 429 },
    )

    const error = await ApiError.fromResponse(response)

    expect(error.status).toBe(429)
    expect(error.code).toBe('RATE_LIMITED')
  })

  it('falls back gracefully on a non-JSON body', async () => {
    const response = new Response('<html>not json</html>', { status: 502 })

    const error = await ApiError.fromResponse(response)

    expect(error.status).toBe(502)
    expect(error.code).toBe('UNKNOWN_ERROR')
  })
})

describe('ApiError.fromNetworkError', () => {
  it('surfaces network failures with status 0 and a NETWORK_ERROR code', () => {
    const error = ApiError.fromNetworkError(new TypeError('Failed to fetch'))

    expect(error.status).toBe(0)
    expect(error.code).toBe('NETWORK_ERROR')
    expect(error.detail).toBe('Failed to fetch')
  })

  it('stringifies non-Error causes', () => {
    const error = ApiError.fromNetworkError('boom')

    expect(error.status).toBe(0)
    expect(error.code).toBe('NETWORK_ERROR')
    expect(error.detail).toBe('boom')
  })
})
