import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../infrastructure/http/ApiError'
import type { Location, PublicBookingGateway } from './ports/PublicBookingGateway'
import { useLocations } from './useLocations'

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

const LOCATIONS: Location[] = [
  {
    id: 'loc-1',
    providerUserId: 'prov-1',
    name: 'Polanco',
    address: 'Av. Reforma 1',
    isActive: true,
    isDefault: true,
    allServices: true,
    travelBufferMinutes: 15,
  },
]

describe('useLocations', () => {
  it('loads locations on mount', async () => {
    const gateway = fakeGateway({ listLocations: vi.fn().mockResolvedValue(LOCATIONS) })
    const { result } = renderHook(() => useLocations(gateway, 'prov-1'))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.locations).toEqual(LOCATIONS)
    expect(result.current.error).toBeNull()
    expect(gateway.listLocations).toHaveBeenCalledWith('prov-1')
  })

  it('exposes a Spanish error message on failure', async () => {
    const gateway = fakeGateway({
      listLocations: vi.fn().mockRejectedValue(new ApiError({ status: 503, code: 'AUTH_UNAVAILABLE' })),
    })
    const { result } = renderHook(() => useLocations(gateway, 'prov-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toMatch(/no está disponible/)
    expect(result.current.locations).toEqual([])
  })

  it('retry re-fetches and can recover from an error', async () => {
    const listLocations = vi.fn().mockRejectedValueOnce(new ApiError({ status: 0, code: 'NETWORK_ERROR' })).mockResolvedValueOnce(LOCATIONS)
    const gateway = fakeGateway({ listLocations })
    const { result } = renderHook(() => useLocations(gateway, 'prov-1'))

    await waitFor(() => expect(result.current.error).not.toBeNull())

    result.current.retry()

    await waitFor(() => expect(result.current.locations).toEqual(LOCATIONS))
    expect(result.current.error).toBeNull()
    expect(listLocations).toHaveBeenCalledTimes(2)
  })
})
