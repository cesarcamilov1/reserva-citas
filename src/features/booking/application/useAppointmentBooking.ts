import { useCallback, useRef, useState } from 'react'
import { describeBookingError, isSlotConflict } from './errors'
import { newIdempotencyKey } from './ports/PublicBookingGateway'
import type { PublicAppointment, PublicBookingGateway } from './ports/PublicBookingGateway'

export type BookingSubmissionPhase = 'idle' | 'sendingOtp' | 'otpSent' | 'verifying' | 'done'

export interface BookingSubmissionState {
  phase: BookingSubmissionPhase
  error: string | null
  appointment: PublicAppointment | null
}

export interface CreateAppointmentParams {
  firstName: string
  lastName: string
  email?: string
  providerUserId: string
  locationId?: string
  serviceId: string
  startsAt: string
  reason?: string
}

export type ConfirmCodeResult =
  | { ok: true; appointment: PublicAppointment }
  | { ok: false; reason: 'otp' | 'slotConflict' | 'other'; message: string }

export interface UseAppointmentBookingResult {
  state: BookingSubmissionState
  requestCode: (phoneE164: string) => Promise<void>
  resendCode: () => Promise<void>
  confirmCode: (code: string, appointment: CreateAppointmentParams) => Promise<ConfirmCodeResult>
  reset: () => void
}

const INITIAL_STATE: BookingSubmissionState = { phase: 'idle', error: null, appointment: null }

export function useAppointmentBooking(gateway: PublicBookingGateway): UseAppointmentBookingResult {
  const [state, setState] = useState<BookingSubmissionState>(INITIAL_STATE)
  const challengeRef = useRef('')
  const phoneRef = useRef('')
  const idempotencyKeyRef = useRef(newIdempotencyKey())

  const requestCode = useCallback(
    async (phoneE164: string) => {
      setState({ phase: 'sendingOtp', error: null, appointment: null })
      try {
        const challenge = await gateway.requestOtp(phoneE164)
        challengeRef.current = challenge.challenge
        phoneRef.current = phoneE164
        setState({ phase: 'otpSent', error: null, appointment: null })
      } catch (cause) {
        setState({ phase: 'idle', error: describeBookingError(cause), appointment: null })
      }
    },
    [gateway],
  )

  const resendCode = useCallback(() => requestCode(phoneRef.current), [requestCode])

  const confirmCode = useCallback(
    async (code: string, input: CreateAppointmentParams): Promise<ConfirmCodeResult> => {
      setState((prev) => ({ ...prev, phase: 'verifying', error: null }))

      let verificationToken: string
      try {
        verificationToken = await gateway.verifyOtp(challengeRef.current, code)
      } catch (cause) {
        const message = describeBookingError(cause)
        setState({ phase: 'otpSent', error: message, appointment: null })
        return { ok: false, reason: 'otp', message }
      }

      try {
        const appointment = await gateway.createAppointment(
          {
            verificationToken,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            providerUserId: input.providerUserId,
            locationId: input.locationId,
            serviceIds: [input.serviceId],
            startsAt: input.startsAt,
            reason: input.reason,
          },
          idempotencyKeyRef.current,
        )
        setState({ phase: 'done', error: null, appointment })
        return { ok: true, appointment }
      } catch (cause) {
        const message = describeBookingError(cause)
        const reason = isSlotConflict(cause) ? 'slotConflict' : 'other'
        setState({ phase: reason === 'slotConflict' ? 'idle' : 'otpSent', error: message, appointment: null })
        return { ok: false, reason, message }
      }
    },
    [gateway],
  )

  const reset = useCallback(() => {
    challengeRef.current = ''
    phoneRef.current = ''
    idempotencyKeyRef.current = newIdempotencyKey()
    setState(INITIAL_STATE)
  }, [])

  return { state, requestCode, resendCode, confirmCode, reset }
}
