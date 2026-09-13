import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../infrastructure/http/ApiError'
import { describeBookingError, describeLoadError } from './errors'
import { newIdempotencyKey } from './ports/PublicBookingGateway'
import type { PublicAppointment, PublicBookingGateway } from './ports/PublicBookingGateway'

export interface UseAppointmentManageResult {
  appointment: PublicAppointment | null
  loading: boolean
  notFound: boolean
  error: string | null
  confirming: boolean
  cancelling: boolean
  actionError: string | null
  confirm: () => Promise<void>
  cancel: () => Promise<void>
  retry: () => void
}

export function useAppointmentManage(gateway: PublicBookingGateway, publicRef: string): UseAppointmentManageResult {
  const [appointment, setAppointment] = useState<PublicAppointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const load = useCallback(() => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)
    setNotFound(false)

    gateway
      .getAppointment(publicRef)
      .then((result) => {
        if (requestIdRef.current !== requestId) return
        setAppointment(result)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (requestIdRef.current !== requestId) return
        setLoading(false)
        if (cause instanceof ApiError && cause.status === 404) {
          setNotFound(true)
          return
        }
        setError(describeLoadError(cause))
      })
  }, [gateway, publicRef])

  useEffect(() => {
    load()
  }, [load])

  const confirm = useCallback(async () => {
    setConfirming(true)
    setActionError(null)
    try {
      const updated = await gateway.confirmAppointment(publicRef, newIdempotencyKey())
      setAppointment(updated)
    } catch (cause) {
      setActionError(describeBookingError(cause))
    } finally {
      setConfirming(false)
    }
  }, [gateway, publicRef])

  const cancel = useCallback(async () => {
    setCancelling(true)
    setActionError(null)
    try {
      const updated = await gateway.cancelAppointment(publicRef, newIdempotencyKey())
      setAppointment(updated)
    } catch (cause) {
      setActionError(describeBookingError(cause))
    } finally {
      setCancelling(false)
    }
  }, [gateway, publicRef])

  return { appointment, loading, notFound, error, confirming, cancelling, actionError, confirm, cancel, retry: load }
}
