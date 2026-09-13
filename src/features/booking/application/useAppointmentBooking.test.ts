import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../infrastructure/http/ApiError'
import type { PublicAppointment, PublicBookingGateway } from './ports/PublicBookingGateway'
import { useAppointmentBooking } from './useAppointmentBooking'

function fakeGateway(overrides: Partial<PublicBookingGateway> = {}): PublicBookingGateway {
  return {
    listLocations: vi.fn(),
    listLocationServices: vi.fn(),
    getAvailability: vi.fn(),
    requestOtp: vi.fn(),
    verifyOtp: vi.fn(),
    createAppointment: vi.fn(),
    getAppointment: vi.fn(),
    confirmAppointment: vi.fn(),
    cancelAppointment: vi.fn(),
    ...overrides,
  }
}

const APPOINTMENT: PublicAppointment = {
  publicRef: 'ref-1'.padEnd(32, '0'),
  status: 'PENDING',
  startsAt: '2026-09-15T16:00:00Z',
  endsAt: '2026-09-15T16:30:00Z',
}

const INPUT = {
  firstName: 'Ana',
  lastName: 'Ramírez',
  providerUserId: 'prov-1',
  locationId: 'loc-1',
  serviceId: 'svc-1',
  startsAt: '2026-09-15T16:00:00Z',
}

describe('useAppointmentBooking', () => {
  it('requests an OTP challenge', async () => {
    const gateway = fakeGateway({ requestOtp: vi.fn().mockResolvedValue({ challenge: 'chal-1', message: 'sent' }) })
    const { result } = renderHook(() => useAppointmentBooking(gateway))

    await act(() => result.current.requestCode('+525512345678'))

    expect(result.current.state.phase).toBe('otpSent')
    expect(gateway.requestOtp).toHaveBeenCalledWith('+525512345678')
  })

  it('surfaces a rate-limit error when requesting the OTP fails', async () => {
    const gateway = fakeGateway({
      requestOtp: vi.fn().mockRejectedValue(new ApiError({ status: 429, code: 'RATE_LIMITED' })),
    })
    const { result } = renderHook(() => useAppointmentBooking(gateway))

    await act(() => result.current.requestCode('+525512345678'))

    expect(result.current.state.error).toMatch(/intentos/)
  })

  it('verifies the code and creates the appointment on success', async () => {
    const gateway = fakeGateway({
      requestOtp: vi.fn().mockResolvedValue({ challenge: 'chal-1', message: 'sent' }),
      verifyOtp: vi.fn().mockResolvedValue('verification-token'),
      createAppointment: vi.fn().mockResolvedValue(APPOINTMENT),
    })
    const { result } = renderHook(() => useAppointmentBooking(gateway))

    await act(() => result.current.requestCode('+525512345678'))
    const outcome = await act(() => result.current.confirmCode('123456', INPUT))

    expect(outcome).toEqual({ ok: true, appointment: APPOINTMENT })
    expect(gateway.verifyOtp).toHaveBeenCalledWith('chal-1', '123456')
    expect(gateway.createAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ verificationToken: 'verification-token', serviceIds: ['svc-1'] }),
      expect.any(String),
    )
    expect(result.current.state.phase).toBe('done')
    expect(result.current.state.appointment).toEqual(APPOINTMENT)
  })

  it('reuses the same idempotency key across repeated confirm attempts', async () => {
    const createAppointment = vi.fn().mockRejectedValueOnce(new ApiError({ status: 0, code: 'NETWORK_ERROR' })).mockResolvedValueOnce(APPOINTMENT)
    const gateway = fakeGateway({
      requestOtp: vi.fn().mockResolvedValue({ challenge: 'chal-1', message: 'sent' }),
      verifyOtp: vi.fn().mockResolvedValue('verification-token'),
      createAppointment,
    })
    const { result } = renderHook(() => useAppointmentBooking(gateway))

    await act(() => result.current.requestCode('+525512345678'))
    await act(() => result.current.confirmCode('123456', INPUT))
    await act(() => result.current.confirmCode('123456', INPUT))

    const [firstKey] = createAppointment.mock.calls[0].slice(1)
    const [secondKey] = createAppointment.mock.calls[1].slice(1)
    expect(firstKey).toBe(secondKey)
  })

  it('returns an otp reason when the code is invalid', async () => {
    const gateway = fakeGateway({
      requestOtp: vi.fn().mockResolvedValue({ challenge: 'chal-1', message: 'sent' }),
      verifyOtp: vi.fn().mockRejectedValue(new ApiError({ status: 401, code: 'INVALID_CHALLENGE' })),
    })
    const { result } = renderHook(() => useAppointmentBooking(gateway))

    await act(() => result.current.requestCode('+525512345678'))
    const outcome = await act(() => result.current.confirmCode('000000', INPUT))

    expect(outcome).toMatchObject({ ok: false, reason: 'otp' })
    expect(result.current.state.phase).toBe('otpSent')
    expect(gateway.createAppointment).not.toHaveBeenCalled()
  })

  it('returns a slotConflict reason on a 409 from createAppointment', async () => {
    const gateway = fakeGateway({
      requestOtp: vi.fn().mockResolvedValue({ challenge: 'chal-1', message: 'sent' }),
      verifyOtp: vi.fn().mockResolvedValue('verification-token'),
      createAppointment: vi.fn().mockRejectedValue(new ApiError({ status: 409, code: 'SLOT_CONFLICT' })),
    })
    const { result } = renderHook(() => useAppointmentBooking(gateway))

    await act(() => result.current.requestCode('+525512345678'))
    const outcome = await act(() => result.current.confirmCode('123456', INPUT))

    expect(outcome).toMatchObject({ ok: false, reason: 'slotConflict' })
  })

  it('resendCode re-requests the OTP for the same phone', async () => {
    const requestOtp = vi.fn().mockResolvedValue({ challenge: 'chal-1', message: 'sent' })
    const gateway = fakeGateway({ requestOtp })
    const { result } = renderHook(() => useAppointmentBooking(gateway))

    await act(() => result.current.requestCode('+525512345678'))
    await act(() => result.current.resendCode())

    expect(requestOtp).toHaveBeenNthCalledWith(2, '+525512345678')
  })

  it('reset returns to idle and generates a fresh idempotency key', async () => {
    const createAppointment = vi.fn().mockResolvedValue(APPOINTMENT)
    const gateway = fakeGateway({
      requestOtp: vi.fn().mockResolvedValue({ challenge: 'chal-1', message: 'sent' }),
      verifyOtp: vi.fn().mockResolvedValue('verification-token'),
      createAppointment,
    })
    const { result } = renderHook(() => useAppointmentBooking(gateway))

    await act(() => result.current.requestCode('+525512345678'))
    await act(() => result.current.confirmCode('123456', INPUT))

    act(() => result.current.reset())
    expect(result.current.state.phase).toBe('idle')

    await act(() => result.current.requestCode('+525512345678'))
    await act(() => result.current.confirmCode('123456', INPUT))

    const [firstKey] = createAppointment.mock.calls[0].slice(1)
    const [secondKey] = createAppointment.mock.calls[1].slice(1)
    expect(firstKey).not.toBe(secondKey)
  })
})
