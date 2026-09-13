import { describe, expect, it, vi } from 'vitest'
import { ApiError } from './ApiError'
import { createHttpClient } from './httpClient'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('createHttpClient', () => {
  it('builds a same-origin relative URL when baseUrl is empty', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ items: [] }))
    const client = createHttpClient({ baseUrl: '', fetch: fetchMock })

    await client.get('/api/v1/public/locations', { query: { provider_user_id: 'abc' } })

    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/public/locations?provider_user_id=abc')
  })

  it('performs a GET with query params, skipping undefined values', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ items: [] }))
    const client = createHttpClient({ baseUrl: 'http://api.test', fetch: fetchMock })

    await client.get('/locations', { query: { provider_user_id: 'abc', location_id: undefined } })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://api.test/locations?provider_user_id=abc')
    expect(init.method).toBe('GET')
    expect(init.headers).toMatchObject({ Accept: 'application/json' })
    expect(init.headers).not.toHaveProperty('Content-Type')
  })

  it('performs a POST with a JSON body and Content-Type header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ challenge: 'c1', message: 'sent' }, 202))
    const client = createHttpClient({ baseUrl: 'http://api.test', fetch: fetchMock })

    const result = await client.post('/booking-verifications', { body: { phone_e164: '+5215512345678' } })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://api.test/booking-verifications')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json', Accept: 'application/json' })
    expect(init.body).toBe(JSON.stringify({ phone_e164: '+5215512345678' }))
    expect(result).toEqual({ challenge: 'c1', message: 'sent' })
  })

  it('forwards custom headers such as Idempotency-Key', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
    const client = createHttpClient({ baseUrl: 'http://api.test', fetch: fetchMock })

    await client.post('/appointments', {
      headers: { 'Idempotency-Key': 'idem-123456789012345' },
      body: { first_name: 'Ana' },
    })

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers).toMatchObject({ 'Idempotency-Key': 'idem-123456789012345' })
  })

  it('returns undefined for an empty successful body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    const client = createHttpClient({ baseUrl: 'http://api.test', fetch: fetchMock })

    const result = await client.post('/appointments/ref/confirm', { headers: { 'Idempotency-Key': 'k'.repeat(16) } })

    expect(result).toBeUndefined()
  })

  it('throws an ApiError built from problem+json on a non-2xx response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          type: 'about:blank',
          title: 'Invalid',
          status: 400,
          code: 'INVALID_REQUEST',
          detail: 'bad input',
          request_id: 'req-1',
          errors: [{ field: 'phone_e164', code: 'PATTERN', message: 'must be E.164' }],
        }),
        { status: 400 },
      ),
    )
    const client = createHttpClient({ baseUrl: 'http://api.test', fetch: fetchMock })

    await expect(client.post('/booking-verifications', { body: {} })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_REQUEST',
      fieldErrors: [{ field: 'phone_e164', code: 'PATTERN', message: 'must be E.164' }],
    })
  })

  it('throws an ApiError on a 429 rate-limited response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 429, code: 'RATE_LIMITED', title: 't', detail: 'd', request_id: 'r' }), {
        status: 429,
      }),
    )
    const client = createHttpClient({ baseUrl: 'http://api.test', fetch: fetchMock })

    await expect(client.get('/availability')).rejects.toMatchObject({ status: 429, code: 'RATE_LIMITED' })
  })

  it('throws an INVALID_RESPONSE ApiError when a 2xx body is not valid JSON', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(new Response('not json', { status: 200, headers: { 'Content-Type': 'application/json' } })),
      )
    const client = createHttpClient({ baseUrl: 'http://api.test', fetch: fetchMock })

    await expect(client.get('/locations')).rejects.toBeInstanceOf(ApiError)
    await expect(client.get('/locations')).rejects.toMatchObject({ status: 200, code: 'INVALID_RESPONSE' })
  })

  it('throws a NETWORK_ERROR ApiError when fetch rejects', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    const client = createHttpClient({ baseUrl: 'http://api.test', fetch: fetchMock })

    await expect(client.get('/locations')).rejects.toBeInstanceOf(ApiError)
    await expect(client.get('/locations')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' })
  })
})
