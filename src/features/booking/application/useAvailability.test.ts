import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../infrastructure/http/ApiError'
import type { AvailabilitySlot, PublicBookingGateway } from './ports/PublicBookingGateway'
import { useAvailability } from './useAvailability'

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

const SLOTS: AvailabilitySlot[] = [
  { startsAt: '2026-09-15T16:00:00Z', endsAt: '2026-09-15T16:30:00Z' },
  { startsAt: '2026-09-16T16:00:00Z', endsAt: '2026-09-16T16:30:00Z' },
]

const NOW = new Date(2026, 8, 11)

describe('useAvailability', () => {
  it('does not fetch when no service is selected', () => {
    const gateway = fakeGateway()
    const { result } = renderHook(() =>
      useAvailability(gateway, { providerUserId: 'prov-1', serviceId: '', locationId: '', monthOffset: 0, now: NOW }),
    )

    expect(result.current.loading).toBe(false)
    expect(gateway.getAvailability).not.toHaveBeenCalled()
  })

  it('fetches the visible month range for the selected service and derives open days', async () => {
    const gateway = fakeGateway({ getAvailability: vi.fn().mockResolvedValue(SLOTS) })
    const { result } = renderHook(() =>
      useAvailability(gateway, {
        providerUserId: 'prov-1',
        serviceId: 'svc-1',
        locationId: 'loc-1',
        monthOffset: 0,
        now: NOW,
      }),
    )

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(gateway.getAvailability).toHaveBeenCalledWith(
      expect.objectContaining({ providerUserId: 'prov-1', serviceId: 'svc-1', locationId: 'loc-1', from: '2026-09-11', to: '2026-09-30' }),
    )
    expect(result.current.slots).toEqual(SLOTS)
    expect(result.current.openDayKeys.has('2026-09-15')).toBe(true)
    expect(result.current.openDayKeys.has('2026-09-16')).toBe(true)
    expect(result.current.openDayKeys.has('2026-09-17')).toBe(false)
  })

  it('omits locationId when none is selected', async () => {
    const gateway = fakeGateway({ getAvailability: vi.fn().mockResolvedValue([]) })
    renderHook(() =>
      useAvailability(gateway, { providerUserId: 'prov-1', serviceId: 'svc-1', locationId: '', monthOffset: 0, now: NOW }),
    )

    await waitFor(() => expect(gateway.getAvailability).toHaveBeenCalled())
    expect(gateway.getAvailability).toHaveBeenCalledWith(expect.objectContaining({ locationId: undefined }))
  })

  it('exposes a Spanish error message on failure', async () => {
    const gateway = fakeGateway({
      getAvailability: vi.fn().mockRejectedValue(new ApiError({ status: 429, code: 'RATE_LIMITED' })),
    })
    const { result } = renderHook(() =>
      useAvailability(gateway, { providerUserId: 'prov-1', serviceId: 'svc-1', locationId: '', monthOffset: 0, now: NOW }),
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toMatch(/demasiadas/)
  })
})
