import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../infrastructure/http/ApiError'
import type { PublicAppointment, PublicBookingGateway } from './ports/PublicBookingGateway'
import { useAppointmentManage } from './useAppointmentManage'

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

describe('useAppointmentManage', () => {
  it('loads the appointment by public ref', async () => {
    const gateway = fakeGateway({ getAppointment: vi.fn().mockResolvedValue(APPOINTMENT) })
    const { result } = renderHook(() => useAppointmentManage(gateway, APPOINTMENT.publicRef))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.appointment).toEqual(APPOINTMENT)
    expect(gateway.getAppointment).toHaveBeenCalledWith(APPOINTMENT.publicRef)
  })

  it('flags a 404 as not found', async () => {
    const gateway = fakeGateway({
      getAppointment: vi.fn().mockRejectedValue(new ApiError({ status: 404, code: 'NOT_FOUND' })),
    })
    const { result } = renderHook(() => useAppointmentManage(gateway, 'missing'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.notFound).toBe(true)
    expect(result.current.appointment).toBeNull()
  })

  it('confirms a pending appointment', async () => {
    const gateway = fakeGateway({
      getAppointment: vi.fn().mockResolvedValue(APPOINTMENT),
      confirmAppointment: vi.fn().mockResolvedValue({ ...APPOINTMENT, status: 'CONFIRMED' }),
    })
    const { result } = renderHook(() => useAppointmentManage(gateway, APPOINTMENT.publicRef))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(() => result.current.confirm())

    expect(result.current.appointment?.status).toBe('CONFIRMED')
    expect(gateway.confirmAppointment).toHaveBeenCalledWith(APPOINTMENT.publicRef, expect.any(String))
  })

  it('cancels an appointment and surfaces an error on failure', async () => {
    const gateway = fakeGateway({
      getAppointment: vi.fn().mockResolvedValue(APPOINTMENT),
      cancelAppointment: vi.fn().mockRejectedValue(new ApiError({ status: 409, code: 'INVALID_TRANSITION' })),
    })
    const { result } = renderHook(() => useAppointmentManage(gateway, APPOINTMENT.publicRef))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(() => result.current.cancel())

    expect(result.current.actionError).toBeTruthy()
    expect(result.current.cancelling).toBe(false)
  })
})
