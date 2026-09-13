import { useCallback, useEffect, useRef, useState } from 'react'
import { dayKey, monthRange, splitDateRange } from '../domain/availability'
import type { AvailabilitySlot, PublicBookingGateway } from './ports/PublicBookingGateway'
import { describeLoadError } from './errors'

export interface UseAvailabilityParams {
  providerUserId: string
  serviceId: string
  locationId: string
  monthOffset: number
  now: Date
}

export interface UseAvailabilityResult {
  slots: AvailabilitySlot[]
  openDayKeys: Set<string>
  loading: boolean
  error: string | null
  retry: () => void
}

export function useAvailability(
  gateway: PublicBookingGateway,
  { providerUserId, serviceId, locationId, monthOffset, now }: UseAvailabilityParams,
): UseAvailabilityResult {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const nowTime = now.getTime()

  const load = useCallback(() => {
    if (!serviceId) {
      setSlots([])
      setLoading(false)
      setError(null)
      return
    }

    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)

    const { from, to } = monthRange(monthOffset, new Date(nowTime))
    const chunks = splitDateRange(from, to)

    Promise.all(
      chunks.map((chunk) =>
        gateway.getAvailability({
          providerUserId,
          serviceId,
          from: chunk.from,
          to: chunk.to,
          locationId: locationId || undefined,
        }),
      ),
    )
      .then((results) => {
        if (requestIdRef.current !== requestId) return
        setSlots(results.flat())
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (requestIdRef.current !== requestId) return
        setError(describeLoadError(cause))
        setLoading(false)
      })
  }, [gateway, providerUserId, serviceId, locationId, monthOffset, nowTime])

  useEffect(() => {
    load()
  }, [load])

  const openDayKeys = new Set(slots.map((slot) => dayKey(new Date(slot.startsAt))))

  return { slots, openDayKeys, loading, error, retry: load }
}
