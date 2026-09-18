import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../infrastructure/http/ApiError'
import type {
  AvailabilitySlot,
  BookableService,
  Location,
  PublicAppointment,
  PublicBookingGateway,
} from '../application/ports/PublicBookingGateway'
import { BookingFlow } from './BookingFlow'

const LOCATIONS: Location[] = [
  {
    id: 'loc-1',
    providerUserId: 'prov-1',
    name: 'Clínica Polanco',
    address: 'Av. Horacio 1855',
    isActive: true,
    isDefault: true,
    allServices: true,
    travelBufferMinutes: 15,
  },
]

const CUERNAVACA: Location = {
  ...LOCATIONS[0],
  id: 'loc-cuernavaca',
  name: 'Consultorio CUERNAVACA',
  address: 'Av. Morelos 100, Cuernavaca',
  isDefault: false,
}

const SERVICES: BookableService[] = [
  {
    id: 'svc-1',
    code: 'PRIMERA',
    name: 'Consulta de primera vez',
    description: 'Historia clínica completa',
    durationMinutes: 45,
    defaultPrice: '900.00',
    currency: 'MXN',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
  },
]

const SLOTS: AvailabilitySlot[] = [{ startsAt: '2026-09-15T16:15:00Z', endsAt: '2026-09-15T17:00:00Z' }]

const APPOINTMENT: PublicAppointment = {
  publicRef: 'ref-1'.padEnd(32, '0'),
  status: 'PENDING',
  startsAt: '2026-09-15T16:15:00Z',
  endsAt: '2026-09-15T17:00:00Z',
}

function fakeGateway(overrides: Partial<PublicBookingGateway> = {}): PublicBookingGateway {
  return {
    listLocations: vi.fn().mockResolvedValue(LOCATIONS),
    listLocationServices: vi.fn().mockResolvedValue(SERVICES),
    getAvailability: vi.fn().mockResolvedValue(SLOTS),
    requestOtp: vi.fn().mockResolvedValue({ challenge: 'chal-1', message: 'sent' }),
    verifyOtp: vi.fn().mockResolvedValue('verification-token'),
    createAppointment: vi.fn().mockResolvedValue(APPOINTMENT),
    getAppointment: vi.fn(),
    confirmAppointment: vi.fn(),
    cancelAppointment: vi.fn().mockResolvedValue({ ...APPOINTMENT, status: 'CANCELLED' }),
    ...overrides,
  }
}

describe('BookingFlow', () => {
  it('defaults to Cuernavaca without overriding a later manual selection', async () => {
    const user = userEvent.setup()
    const gateway = fakeGateway({ listLocations: vi.fn().mockResolvedValue([LOCATIONS[0], CUERNAVACA]) })
    render(<BookingFlow gateway={gateway} providerUserId="prov-1" now={new Date(2026, 8, 11)} />)

    expect(screen.getByText('¿Dónde te queda mejor?')).toBeInTheDocument()
    expect(screen.getByText('Continuar')).toBeDisabled()
    expect(gateway.listLocationServices).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue(CUERNAVACA.id))
    expect(screen.getByText('Continuar')).toBeEnabled()
    await waitFor(() => expect(gateway.listLocationServices).toHaveBeenCalledWith('prov-1', CUERNAVACA.id))

    await user.selectOptions(screen.getByLabelText('Dirección del consultorio'), 'loc-1')
    expect(screen.getAllByText(LOCATIONS[0].address)).toHaveLength(3)
    expect(screen.getByText('Continuar')).toBeEnabled()
    await user.click(screen.getByText('Continuar'))

    expect(screen.getByText('¿Qué necesitas atender?')).toBeInTheDocument()
    expect(screen.getAllByText(LOCATIONS[0].address)).toHaveLength(2)
    await waitFor(() => expect(gateway.listLocationServices).toHaveBeenLastCalledWith('prov-1', 'loc-1'))
    await user.click(screen.getByText('Atrás'))
    expect(screen.getByRole('combobox')).toHaveValue('loc-1')
  })

  it.each([
    ['name before address', [{ ...LOCATIONS[0], address: 'Centro, Cuernavaca' }, CUERNAVACA], CUERNAVACA.id],
    ['address when name is generic', [LOCATIONS[0], { ...CUERNAVACA, name: 'Consultorio Centro' }], CUERNAVACA.id],
    ['API default without Cuernavaca', [{ ...LOCATIONS[0], id: 'other', isDefault: false }, LOCATIONS[0]], 'loc-1'],
    ['first clinic without any default', [{ ...LOCATIONS[0], isDefault: false }], 'loc-1'],
  ])('selects the %s', async (_label, locations, expectedId) => {
    const gateway = fakeGateway({ listLocations: vi.fn().mockResolvedValue(locations) })
    render(<BookingFlow gateway={gateway} providerUserId="prov-1" />)
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue(expectedId))
    await waitFor(() => expect(gateway.listLocationServices).toHaveBeenCalledWith('prov-1', expectedId))
  })

  it('keeps selection empty after a load error and applies the default after retry', async () => {
    const user = userEvent.setup()
    const gateway = fakeGateway({
      listLocations: vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue([CUERNAVACA]),
    })
    render(<BookingFlow gateway={gateway} providerUserId="prov-1" />)
    await screen.findByRole('alert')
    expect(screen.getByText('Continuar')).toBeDisabled()
    expect(gateway.listLocationServices).not.toHaveBeenCalled()
    await user.click(screen.getByText('Reintentar'))
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue(CUERNAVACA.id))
  })

  it('keeps the clinic step invalid when no clinics are returned', async () => {
    const gateway = fakeGateway({ listLocations: vi.fn().mockResolvedValue([]) })
    render(<BookingFlow gateway={gateway} providerUserId="prov-1" now={new Date(2026, 8, 11)} />)

    await waitFor(() => expect(screen.queryByText('Cargando sedes…')).not.toBeInTheDocument())
    expect(screen.getByText('Continuar')).toBeDisabled()
    expect(gateway.listLocationServices).not.toHaveBeenCalled()
  })

  it('completes the full booking flow end to end', async () => {
    const user = userEvent.setup()
    const gateway = fakeGateway({ listLocations: vi.fn().mockResolvedValue([LOCATIONS[0], CUERNAVACA]) })
    render(<BookingFlow gateway={gateway} providerUserId="prov-1" now={new Date(2026, 8, 11)} />)

    // Step 0: clinic
    await waitFor(() => expect(screen.getByLabelText('Dirección del consultorio')).toBeInTheDocument())
    await user.selectOptions(screen.getByLabelText('Dirección del consultorio'), 'loc-1')
    await user.click(screen.getByText('Continuar'))

    // Step 1: service
    await waitFor(() => expect(screen.getByText('Consulta de primera vez')).toBeInTheDocument())
    await user.click(screen.getByText('Consulta de primera vez'))
    await user.click(screen.getByText('Continuar'))

    // Step 2: schedule
    await waitFor(() => expect(gateway.getAvailability).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText('15')).toBeInTheDocument())
    await user.click(screen.getByText('15'))
    await waitFor(() => expect(screen.getByText('10:15')).toBeInTheDocument())
    await user.click(screen.getByText('10:15'))
    await user.click(screen.getByText('Continuar'))

    // Step 3: patient
    await user.type(screen.getByLabelText('Nombre(s)'), 'Ana')
    await user.type(screen.getByLabelText('Apellidos'), 'Ramírez')
    await user.type(screen.getByLabelText('Celular con WhatsApp'), '5512345678')
    await user.click(screen.getByText('Revisar mi cita'))

    // Step 4: confirm -> request OTP
    expect(screen.getByText('Revisa antes de confirmar')).toBeInTheDocument()
    expect(screen.getAllByText(LOCATIONS[0].address)).toHaveLength(3)
    await user.click(screen.getByText('Confirmar cita'))

    await waitFor(() => expect(gateway.requestOtp).toHaveBeenCalledWith('+525512345678'))
    await waitFor(() => expect(screen.getByLabelText('Código de verificación')).toBeInTheDocument())

    await user.type(screen.getByLabelText('Código de verificación'), '123456')
    await user.click(screen.getByText('Verificar y confirmar'))

    await waitFor(() => expect(screen.getByText('Tu cita quedó agendada')).toBeInTheDocument())
    expect(screen.getByText(APPOINTMENT.publicRef)).toBeInTheDocument()
    expect(gateway.createAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ startsAt: '2026-09-15T16:15:00Z', serviceIds: ['svc-1'], locationId: 'loc-1' }),
      expect.any(String),
    )

    await user.click(screen.getByText('Agendar otra cita'))
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue(CUERNAVACA.id))
    expect(screen.getAllByText(CUERNAVACA.address)).toHaveLength(3)
    await waitFor(() => expect(gateway.listLocationServices).toHaveBeenLastCalledWith('prov-1', CUERNAVACA.id))
  })

  it('sends the flow back to the schedule step on a 409 slot conflict', async () => {
    const user = userEvent.setup()
    const gateway = fakeGateway({
      createAppointment: vi.fn().mockRejectedValue(new ApiError({ status: 409, code: 'SLOT_CONFLICT' })),
    })

    render(<BookingFlow gateway={gateway} providerUserId="prov-1" now={new Date(2026, 8, 11)} />)

    await waitFor(() => expect(screen.getByLabelText('Dirección del consultorio')).toBeInTheDocument())
    await user.selectOptions(screen.getByLabelText('Dirección del consultorio'), 'loc-1')
    await user.click(screen.getByText('Continuar'))
    await waitFor(() => expect(screen.getByText('Consulta de primera vez')).toBeInTheDocument())
    await user.click(screen.getByText('Consulta de primera vez'))
    await user.click(screen.getByText('Continuar'))
    await waitFor(() => expect(screen.getByText('15')).toBeInTheDocument())
    await user.click(screen.getByText('15'))
    await waitFor(() => expect(screen.getByText('10:15')).toBeInTheDocument())
    await user.click(screen.getByText('10:15'))
    await user.click(screen.getByText('Continuar'))
    await user.type(screen.getByLabelText('Nombre(s)'), 'Ana')
    await user.type(screen.getByLabelText('Apellidos'), 'Ramírez')
    await user.type(screen.getByLabelText('Celular con WhatsApp'), '5512345678')
    await user.click(screen.getByText('Revisar mi cita'))
    await user.click(screen.getByText('Confirmar cita'))
    await waitFor(() => expect(screen.getByLabelText('Código de verificación')).toBeInTheDocument())
    await user.type(screen.getByLabelText('Código de verificación'), '123456')
    await user.click(screen.getByText('Verificar y confirmar'))

    await waitFor(() => expect(screen.getByText('Elige día y hora')).toBeInTheDocument())
  })
})
