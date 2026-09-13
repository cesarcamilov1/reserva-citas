import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useBookingFlow } from './useBookingFlow'

describe('useBookingFlow', () => {
  it('starts at step 0 with nothing selected', () => {
    const { result } = renderHook(() => useBookingFlow())
    expect(result.current.state.step).toBe(0)
    expect(result.current.state.clinicId).toBe('')
    expect(result.current.state.done).toBe(false)
  })

  it('blocks advancing while the current step is invalid', () => {
    const { result } = renderHook(() => useBookingFlow())
    act(() => result.current.actions.next())
    expect(result.current.state.step).toBe(0)

    act(() => result.current.actions.setClinic('loc-polanco'))
    act(() => result.current.actions.next())
    expect(result.current.state.step).toBe(1)
  })

  it('clears the service, day and time when the clinic changes', () => {
    const { result } = renderHook(() => useBookingFlow())
    act(() => result.current.actions.setClinic('loc-roma'))
    act(() => result.current.actions.setService('svc-1'))
    act(() => result.current.actions.setDay('2026-09-22'))
    act(() => result.current.actions.setTime('10:15', '2026-09-22T16:15:00Z', '2026-09-22T17:00:00Z'))
    expect(result.current.state.day).toBe('2026-09-22')
    expect(result.current.state.time).toBe('10:15')

    act(() => result.current.actions.setClinic('loc-polanco'))
    expect(result.current.state.serviceId).toBe('')
    expect(result.current.state.day).toBe('')
    expect(result.current.state.time).toBe('')
    expect(result.current.state.slotStartsAt).toBe('')
  })

  it('clears the chosen time when the day changes', () => {
    const { result } = renderHook(() => useBookingFlow())
    act(() => result.current.actions.setClinic('loc-roma'))
    act(() => result.current.actions.setDay('2026-09-22'))
    act(() => result.current.actions.setTime('10:15', '2026-09-22T16:15:00Z', '2026-09-22T17:00:00Z'))
    act(() => result.current.actions.setDay('2026-09-23'))
    expect(result.current.state.time).toBe('')
    expect(result.current.state.slotStartsAt).toBe('')
  })

  it('stores the slot start/end instants alongside the display time', () => {
    const { result } = renderHook(() => useBookingFlow())
    act(() => result.current.actions.setTime('10:15', '2026-09-22T16:15:00Z', '2026-09-22T17:00:00Z'))
    expect(result.current.state.slotStartsAt).toBe('2026-09-22T16:15:00Z')
    expect(result.current.state.slotEndsAt).toBe('2026-09-22T17:00:00Z')
  })

  it('going back preserves what was entered', () => {
    const { result } = renderHook(() => useBookingFlow())
    act(() => result.current.actions.setClinic('loc-polanco'))
    act(() => result.current.actions.next())
    act(() => result.current.actions.setService('svc-1'))
    act(() => result.current.actions.back())
    expect(result.current.state.step).toBe(0)
    expect(result.current.state.serviceId).toBe('svc-1')
    expect(result.current.state.clinicId).toBe('loc-polanco')
  })

  it('allows jumping back to any reached step via goToStep, but not ahead', () => {
    const { result } = renderHook(() => useBookingFlow())
    act(() => result.current.actions.setClinic('loc-polanco'))
    act(() => result.current.actions.next())
    expect(result.current.state.reached).toBe(1)

    act(() => result.current.actions.goToStep(0))
    expect(result.current.state.step).toBe(0)

    act(() => result.current.actions.goToStep(4))
    expect(result.current.state.step).toBe(0)
  })

  it('marks done on confirming the final step', () => {
    const { result } = renderHook(() => useBookingFlow())
    act(() => result.current.actions.setClinic('loc-polanco'))
    act(() => result.current.actions.next())
    act(() => result.current.actions.setService('svc-1'))
    act(() => result.current.actions.next())
    act(() => result.current.actions.setDay('2026-09-22'))
    act(() => result.current.actions.setTime('10:15', '2026-09-22T16:15:00Z', '2026-09-22T17:00:00Z'))
    act(() => result.current.actions.next())
    act(() => result.current.actions.setPatientField('firstName', 'Ana'))
    act(() => result.current.actions.setPatientField('lastName', 'Ramírez'))
    act(() => result.current.actions.setPatientField('phone', '55 1234 5678'))
    act(() => result.current.actions.next())
    expect(result.current.state.step).toBe(4)
    act(() => result.current.actions.next())
    expect(result.current.state.done).toBe(true)
  })

  it('reset clears everything back to the initial state', () => {
    const { result } = renderHook(() => useBookingFlow())
    act(() => result.current.actions.setClinic('loc-polanco'))
    act(() => result.current.actions.setPatientField('firstName', 'Ana'))
    act(() => result.current.actions.reset())
    expect(result.current.state.clinicId).toBe('')
    expect(result.current.state.patient.firstName).toBe('')
    expect(result.current.state.step).toBe(0)
    expect(result.current.state.reached).toBe(0)
  })

  it('clearSchedule sends the flow back to the schedule step and drops the chosen slot', () => {
    const { result } = renderHook(() => useBookingFlow())
    act(() => result.current.actions.setClinic('loc-polanco'))
    act(() => result.current.actions.next())
    act(() => result.current.actions.setService('svc-1'))
    act(() => result.current.actions.next())
    act(() => result.current.actions.setDay('2026-09-22'))
    act(() => result.current.actions.setTime('10:15', '2026-09-22T16:15:00Z', '2026-09-22T17:00:00Z'))
    act(() => result.current.actions.next())

    act(() => result.current.actions.clearSchedule())

    expect(result.current.state.step).toBe(2)
    expect(result.current.state.day).toBe('')
    expect(result.current.state.time).toBe('')
    // The clinic and service picked earlier are preserved.
    expect(result.current.state.clinicId).toBe('loc-polanco')
    expect(result.current.state.serviceId).toBe('svc-1')
  })
})
