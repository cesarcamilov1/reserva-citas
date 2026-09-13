import { useCallback, useEffect, useRef, useState } from 'react'
import type { BookableService, PublicBookingGateway } from './ports/PublicBookingGateway'
import { describeLoadError } from './errors'

export interface UseLocationServicesResult {
  services: BookableService[]
  loading: boolean
  error: string | null
  retry: () => void
}

export function useLocationServices(
  gateway: PublicBookingGateway,
  providerUserId: string,
  locationId: string,
): UseLocationServicesResult {
  const [services, setServices] = useState<BookableService[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const load = useCallback(() => {
    if (!locationId) {
      setServices([])
      setLoading(false)
      setError(null)
      return
    }

    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)

    gateway
      .listLocationServices(providerUserId, locationId)
      .then((result) => {
        if (requestIdRef.current !== requestId) return
        setServices(result)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (requestIdRef.current !== requestId) return
        setError(describeLoadError(cause))
        setLoading(false)
      })
  }, [gateway, providerUserId, locationId])

  useEffect(() => {
    load()
  }, [load])

  return { services, loading, error, retry: load }
}
