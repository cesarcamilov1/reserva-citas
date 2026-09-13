import { useCallback, useEffect, useRef, useState } from 'react'
import type { Location, PublicBookingGateway } from './ports/PublicBookingGateway'
import { describeLoadError } from './errors'

export interface UseLocationsResult {
  locations: Location[]
  loading: boolean
  error: string | null
  retry: () => void
}

export function useLocations(gateway: PublicBookingGateway, providerUserId: string): UseLocationsResult {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const load = useCallback(() => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)

    gateway
      .listLocations(providerUserId)
      .then((result) => {
        if (requestIdRef.current !== requestId) return
        setLocations(result)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (requestIdRef.current !== requestId) return
        setError(describeLoadError(cause))
        setLoading(false)
      })
  }, [gateway, providerUserId])

  useEffect(() => {
    load()
  }, [load])

  return { locations, loading, error, retry: load }
}
