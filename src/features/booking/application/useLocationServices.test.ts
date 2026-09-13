import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../infrastructure/http/ApiError'
import type { BookableService, PublicBookingGateway } from './ports/PublicBookingGateway'
import { useLocationServices } from './useLocationServices'

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

const SERVICES: BookableService[] = [
  {
    id: 'svc-1',
    code: 'PRIMERA',
    name: 'Consulta de primera vez',
    durationMinutes: 45,
    defaultPrice: '900.00',
    currency: 'MXN',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
  },
]

describe('useLocationServices', () => {
  it('does not fetch when no location is selected', () => {
    const gateway = fakeGateway()
    const { result } = renderHook(() => useLocationServices(gateway, 'prov-1', ''))

    expect(result.current.loading).toBe(false)
    expect(result.current.services).toEqual([])
    expect(gateway.listLocationServices).not.toHaveBeenCalled()
  })

  it('loads services for the selected location', async () => {
    const gateway = fakeGateway({ listLocationServices: vi.fn().mockResolvedValue(SERVICES) })
    const { result } = renderHook(() => useLocationServices(gateway, 'prov-1', 'loc-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.services).toEqual(SERVICES)
    expect(gateway.listLocationServices).toHaveBeenCalledWith('prov-1', 'loc-1')
  })

  it('clears services and re-fetches when the location changes', async () => {
    const listLocationServices = vi.fn().mockResolvedValue(SERVICES)
    const gateway = fakeGateway({ listLocationServices })
    const { result, rerender } = renderHook(({ locationId }) => useLocationServices(gateway, 'prov-1', locationId), {
      initialProps: { locationId: 'loc-1' },
    })

    await waitFor(() => expect(result.current.services).toEqual(SERVICES))

    rerender({ locationId: '' })
    expect(result.current.services).toEqual([])
  })

  it('exposes a Spanish error message on failure', async () => {
    const gateway = fakeGateway({
      listLocationServices: vi.fn().mockRejectedValue(new ApiError({ status: 404, code: 'NOT_FOUND' })),
    })
    const { result } = renderHook(() => useLocationServices(gateway, 'prov-1', 'loc-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeTruthy()
  })
})
