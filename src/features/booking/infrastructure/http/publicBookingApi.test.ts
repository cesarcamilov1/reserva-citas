import { describe, expect, it, vi } from 'vitest'
import { createHttpClient } from './httpClient'
import { createPublicBookingApi } from './publicBookingApi'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function setup(fetchImpl: ReturnType<typeof vi.fn>) {
  const httpClient = createHttpClient({ baseUrl: 'http://api.test', fetch: fetchImpl as unknown as typeof fetch })
  return createPublicBookingApi(httpClient)
}

describe('createPublicBookingApi', () => {
  it('listLocations builds the URL and maps the DTO to camelCase', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        items: [
          {
            id: 'loc-1',
            provider_user_id: 'prov-1',
            name: 'Polanco',
            address: 'Av. Reforma 1',
            is_active: true,
            is_default: true,
            all_services: false,
            travel_buffer_minutes: 15,
          },
        ],
      }),
    )
    const api = setup(fetchMock)

    const locations = await api.listLocations('prov-1')

    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/api/v1/public/locations?provider_user_id=prov-1')
    expect(fetchMock.mock.calls[0][1].method).toBe('GET')
    expect(locations).toEqual([
      {
        id: 'loc-1',
        providerUserId: 'prov-1',
        name: 'Polanco',
        address: 'Av. Reforma 1',
        isActive: true,
        isDefault: true,
        allServices: false,
        travelBufferMinutes: 15,
      },
    ])
  })

  it('listLocationServices encodes the location id and maps services', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        items: [
          {
            id: 'svc-1',
            code: 'PRIMERA',
            name: 'Primera consulta',
            description: 'Valoración inicial',
            duration_minutes: 45,
            default_price: '450.00',
            currency: 'MXN',
            is_active: true,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            version: 1,
          },
        ],
      }),
    )
    const api = setup(fetchMock)

    const services = await api.listLocationServices('prov-1', 'loc/with space')

    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://api.test/api/v1/public/locations/loc%2Fwith%20space/services?provider_user_id=prov-1',
    )
    expect(services).toEqual([
      {
        id: 'svc-1',
        code: 'PRIMERA',
        name: 'Primera consulta',
        description: 'Valoración inicial',
        durationMinutes: 45,
        defaultPrice: '450.00',
        currency: 'MXN',
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
        version: 1,
      },
    ])
  })

  it('listLocationServices surfaces a 404 as an ApiError', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        { type: 'about:blank', title: 'Not found', status: 404, code: 'NOT_FOUND', detail: 'no such location', request_id: 'r' },
        404,
      ),
    )
    const api = setup(fetchMock)

    await expect(api.listLocationServices('prov-1', 'missing')).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' })
  })

  it('getAvailability sends provider, service, date range and omits undefined location', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ slots: [{ starts_at: '2026-09-15T10:00:00Z', ends_at: '2026-09-15T10:30:00Z' }] }),
    )
    const api = setup(fetchMock)

    const slots = await api.getAvailability({
      providerUserId: 'prov-1',
      serviceId: 'svc-1',
      from: '2026-09-15',
      to: '2026-09-20',
    })

    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.pathname).toBe('/api/v1/public/availability')
    expect(url.searchParams.get('provider_user_id')).toBe('prov-1')
    expect(url.searchParams.get('service_id')).toBe('svc-1')
    expect(url.searchParams.get('from')).toBe('2026-09-15')
    expect(url.searchParams.get('to')).toBe('2026-09-20')
    expect(url.searchParams.has('location_id')).toBe(false)
    expect(slots).toEqual([{ startsAt: '2026-09-15T10:00:00Z', endsAt: '2026-09-15T10:30:00Z' }])
  })

  it('getAvailability includes location_id when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ slots: [] }))
    const api = setup(fetchMock)

    await api.getAvailability({
      providerUserId: 'prov-1',
      serviceId: 'svc-1',
      from: '2026-09-15',
      to: '2026-09-20',
      locationId: 'loc-1',
    })

    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.searchParams.get('location_id')).toBe('loc-1')
  })

  it('getAvailability surfaces a 429 as an ApiError', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ type: 'about:blank', title: 't', status: 429, code: 'RATE_LIMITED', detail: 'd', request_id: 'r' }, 429),
    )
    const api = setup(fetchMock)

    await expect(
      api.getAvailability({ providerUserId: 'p', serviceId: 's', from: '2026-01-01', to: '2026-01-02' }),
    ).rejects.toMatchObject({ status: 429, code: 'RATE_LIMITED' })
  })

  it('requestOtp POSTs the phone and maps the challenge', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ challenge: 'chal-1', message: 'code sent' }, 202))
    const api = setup(fetchMock)

    const result = await api.requestOtp('+5215512345678')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://api.test/api/v1/public/booking-verifications')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ phone_e164: '+5215512345678' })
    expect(result).toEqual({ challenge: 'chal-1', message: 'code sent' })
  })

  it('requestOtp surfaces a 503 as an ApiError', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ type: 'about:blank', title: 't', status: 503, code: 'AUTH_UNAVAILABLE', detail: 'd', request_id: 'r' }, 503),
    )
    const api = setup(fetchMock)

    await expect(api.requestOtp('+5215512345678')).rejects.toMatchObject({ status: 503, code: 'AUTH_UNAVAILABLE' })
  })

  it('verifyOtp POSTs challenge and code, returning the verification token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ verification_token: 'tok-123456789012345678901234567890' }))
    const api = setup(fetchMock)

    const token = await api.verifyOtp('chal-1', '123456')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://api.test/api/v1/public/booking-verifications/verify')
    expect(JSON.parse(init.body)).toEqual({ challenge: 'chal-1', code: '123456' })
    expect(token).toBe('tok-123456789012345678901234567890')
  })

  it('verifyOtp surfaces a 401 for an invalid challenge', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ type: 'about:blank', title: 't', status: 401, code: 'INVALID_CHALLENGE', detail: 'd', request_id: 'r' }, 401),
    )
    const api = setup(fetchMock)

    await expect(api.verifyOtp('bad', '000000')).rejects.toMatchObject({ status: 401, code: 'INVALID_CHALLENGE' })
  })

  it('createAppointment sends the Idempotency-Key header and maps request/response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        { public_ref: 'ref-'.padEnd(32, '0'), status: 'PENDING', starts_at: '2026-09-15T10:00:00Z', ends_at: '2026-09-15T10:30:00Z' },
        201,
      ),
    )
    const api = setup(fetchMock)

    const appointment = await api.createAppointment(
      {
        verificationToken: 'vt-1',
        firstName: 'Ana',
        lastName: 'Ramírez',
        providerUserId: 'prov-1',
        serviceIds: ['svc-1'],
        startsAt: '2026-09-15T10:00:00Z',
      },
      'idem-key-1234567890',
    )

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://api.test/api/v1/public/appointments')
    expect(init.method).toBe('POST')
    expect(init.headers['Idempotency-Key']).toBe('idem-key-1234567890')
    expect(JSON.parse(init.body)).toEqual({
      verification_token: 'vt-1',
      first_name: 'Ana',
      last_name: 'Ramírez',
      email: undefined,
      provider_user_id: 'prov-1',
      location_id: undefined,
      service_ids: ['svc-1'],
      starts_at: '2026-09-15T10:00:00Z',
      reason: undefined,
    })
    expect(appointment.status).toBe('PENDING')
    expect(appointment.publicRef).toBe('ref-'.padEnd(32, '0'))
  })

  it('createAppointment surfaces a 400 with field errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          type: 'about:blank',
          title: 't',
          status: 400,
          code: 'INVALID_REQUEST',
          detail: 'invalid',
          request_id: 'r',
          errors: [{ field: 'starts_at', code: 'REQUIRED', message: 'is required' }],
        },
        400,
      ),
    )
    const api = setup(fetchMock)

    await expect(
      api.createAppointment(
        {
          verificationToken: 'vt-1',
          firstName: 'Ana',
          lastName: 'Ramírez',
          providerUserId: 'prov-1',
          serviceIds: ['svc-1'],
          startsAt: '',
        },
        'idem-key-1234567890',
      ),
    ).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_REQUEST',
      fieldErrors: [{ field: 'starts_at', code: 'REQUIRED', message: 'is required' }],
    })
  })

  it('createAppointment surfaces a 409 slot conflict', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ status: 409, code: 'SLOT_CONFLICT' }, 409))
    const api = setup(fetchMock)

    await expect(
      api.createAppointment(
        {
          verificationToken: 'vt-1',
          firstName: 'Ana',
          lastName: 'Ramírez',
          providerUserId: 'prov-1',
          serviceIds: ['svc-1'],
          startsAt: '2026-09-15T10:00:00Z',
        },
        'idem-key-1234567890',
      ),
    ).rejects.toMatchObject({ status: 409, code: 'SLOT_CONFLICT' })
  })

  it('getAppointment encodes public_ref and maps the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        public_ref: 'ref with slash/1',
        status: 'CONFIRMED',
        starts_at: '2026-09-15T10:00:00Z',
        ends_at: '2026-09-15T10:30:00Z',
        location_id: 'loc-1',
      }),
    )
    const api = setup(fetchMock)

    const appointment = await api.getAppointment('ref with slash/1')

    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://api.test/api/v1/public/appointments/ref%20with%20slash%2F1',
    )
    expect(appointment).toEqual({
      publicRef: 'ref with slash/1',
      status: 'CONFIRMED',
      startsAt: '2026-09-15T10:00:00Z',
      endsAt: '2026-09-15T10:30:00Z',
      locationId: 'loc-1',
    })
  })

  it('getAppointment surfaces a 404 as an ApiError', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ status: 404, code: 'NOT_FOUND' }, 404))
    const api = setup(fetchMock)

    await expect(api.getAppointment('missing')).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' })
  })

  it('confirmAppointment POSTs with Idempotency-Key and no body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ public_ref: 'ref-1', status: 'CONFIRMED', starts_at: 's', ends_at: 'e' }),
    )
    const api = setup(fetchMock)

    const appointment = await api.confirmAppointment('ref-1', 'idem-key-1234567890')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://api.test/api/v1/public/appointments/ref-1/confirm')
    expect(init.method).toBe('POST')
    expect(init.headers['Idempotency-Key']).toBe('idem-key-1234567890')
    expect(init.body).toBeUndefined()
    expect(appointment.status).toBe('CONFIRMED')
  })

  it('confirmAppointment surfaces a 409 with an empty body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 409 }))
    const api = setup(fetchMock)

    await expect(api.confirmAppointment('ref-1', 'idem-key-1234567890')).rejects.toMatchObject({
      status: 409,
      code: 'UNKNOWN_ERROR',
    })
  })

  it('cancelAppointment POSTs with Idempotency-Key and no body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ public_ref: 'ref-1', status: 'CANCELLED', starts_at: 's', ends_at: 'e' }),
    )
    const api = setup(fetchMock)

    const appointment = await api.cancelAppointment('ref-1', 'idem-key-1234567890')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://api.test/api/v1/public/appointments/ref-1/cancel')
    expect(init.method).toBe('POST')
    expect(init.headers['Idempotency-Key']).toBe('idem-key-1234567890')
    expect(init.body).toBeUndefined()
    expect(appointment.status).toBe('CANCELLED')
  })

  it('cancelAppointment surfaces a 409 with an empty body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 409 }))
    const api = setup(fetchMock)

    await expect(api.cancelAppointment('ref-1', 'idem-key-1234567890')).rejects.toMatchObject({
      status: 409,
      code: 'UNKNOWN_ERROR',
    })
  })

  it('surfaces a network failure consistently across endpoints', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    const api = setup(fetchMock)

    await expect(api.listLocations('prov-1')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' })
  })
})
