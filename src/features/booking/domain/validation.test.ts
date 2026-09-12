import { describe, expect, it } from 'vitest'
import { isPatientStepValid, isStepValid, isValidPhone } from './validation'
import type { BookingState } from './types'

function baseState(overrides: Partial<BookingState> = {}): BookingState {
  return {
    step: 0,
    reached: 0,
    done: false,
    clinicId: '',
    serviceId: '',
    monthOffset: 0,
    day: '',
    time: '',
    patient: { firstName: '', lastName: '', phone: '', birthDate: '', email: '', notes: '' },
    wantsWhatsapp: true,
    showWhatsappPreview: false,
    addedToCalendar: false,
    ...overrides,
  }
}

describe('isValidPhone', () => {
  it('rejects phones with fewer than 10 digits', () => {
    expect(isValidPhone('55 1234 567')).toBe(false)
  })

  it('accepts 10+ digits and ignores formatting characters', () => {
    expect(isValidPhone('55-1234-5678')).toBe(true)
    expect(isValidPhone('(55) 1234 5678')).toBe(true)
  })
})

describe('isPatientStepValid', () => {
  it('requires first name, last name and a valid phone', () => {
    expect(isPatientStepValid({ firstName: '', lastName: '', phone: '', birthDate: '', email: '', notes: '' })).toBe(false)
    expect(
      isPatientStepValid({ firstName: 'Ana', lastName: 'Ramírez', phone: '551234567', birthDate: '', email: '', notes: '' }),
    ).toBe(false)
    expect(
      isPatientStepValid({ firstName: 'Ana', lastName: 'Ramírez', phone: '55 1234 5678', birthDate: '', email: '', notes: '' }),
    ).toBe(true)
  })
})

describe('isStepValid', () => {
  it('gates step 0 on the clinic', () => {
    expect(isStepValid(0, baseState())).toBe(false)
    expect(isStepValid(0, baseState({ clinicId: 'polanco' }))).toBe(true)
  })

  it('gates step 1 on the service', () => {
    expect(isStepValid(1, baseState())).toBe(false)
    expect(isStepValid(1, baseState({ serviceId: 'primera' }))).toBe(true)
  })

  it('gates step 2 on day and time', () => {
    expect(isStepValid(2, baseState({ day: '2026-8-22' }))).toBe(false)
    expect(isStepValid(2, baseState({ day: '2026-8-22', time: '10:15' }))).toBe(true)
  })

  it('gates step 3 on patient info', () => {
    expect(isStepValid(3, baseState())).toBe(false)
    expect(
      isStepValid(
        3,
        baseState({
          patient: { firstName: 'Ana', lastName: 'Ramírez', phone: '55 1234 5678', birthDate: '', email: '', notes: '' },
        }),
      ),
    ).toBe(true)
  })

  it('step 4 (confirm) is always valid', () => {
    expect(isStepValid(4, baseState())).toBe(true)
  })
})
