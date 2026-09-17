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
  it('selects the default clinic automatically and renders only its name', async () => {
    const user = userEvent.setup()
    const locations = [
      { ...LOCATIONS[0], id: 'loc-first', name: 'Clínica Roma', address: 'Durango 123', isDefault: false },
      { ...LOCATIONS[0], id: 'loc-default', name: 'Clínica Condesa' },
    ]
    const gateway = fakeGateway({ listLocations: vi.fn().mockResolvedValue(locations) })
    render(<BookingFlow gateway={gateway} providerUserId="prov-1" now={new Date(2026, 8, 11)} />)

    expect(screen.getByText('Consultorio')).toBeInTheDocument()
    await waitFor(() => expect(gateway.listLocationServices).toHaveBeenCalledWith('prov-1', 'loc-default'))
    expect(screen.getAllByText('Clínica Condesa').length).toBeGreaterThan(0)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByText('Av. Horacio 1855')).not.toBeInTheDocument()

    await user.click(screen.getByText('Continuar'))

    expect(screen.getByText('¿Qué necesitas atender?')).toBeInTheDocument()
  })

  it('falls back to the first clinic when none is the default', async () => {
    const locations = [
      { ...LOCATIONS[0], id: 'loc-first', name: 'Clínica Roma', isDefault: false },
      { ...LOCATIONS[0], id: 'loc-second', name: 'Clínica Condesa', isDefault: false },
    ]
    const gateway = fakeGateway({ listLocations: vi.fn().mockResolvedValue(locations) })

    render(<BookingFlow gateway={gateway} providerUserId="prov-1" now={new Date(2026, 8, 11)} />)

    await waitFor(() => expect(gateway.listLocationServices).toHaveBeenCalledWith('prov-1', 'loc-first'))
    expect(screen.getAllByText('Clínica Roma').length).toBeGreaterThan(0)
  })

  it('does not overwrite an existing clinic when locations reload', async () => {
    const firstGateway = fakeGateway()
    const { rerender } = render(
      <BookingFlow gateway={firstGateway} providerUserId="prov-1" now={new Date(2026, 8, 11)} />,
    )
    await waitFor(() => expect(firstGateway.listLocationServices).toHaveBeenCalledWith('prov-1', 'loc-1'))

    const reloadedLocations = [
      { ...LOCATIONS[0], id: 'loc-new-default', name: 'Clínica Condesa' },
      { ...LOCATIONS[0], isDefault: false },
    ]
    const secondGateway = fakeGateway({ listLocations: vi.fn().mockResolvedValue(reloadedLocations) })
    rerender(<BookingFlow gateway={secondGateway} providerUserId="prov-1" now={new Date(2026, 8, 11)} />)

    await waitFor(() => expect(secondGateway.listLocationServices).toHaveBeenCalledWith('prov-1', 'loc-1'))
    await waitFor(() => expect(screen.getAllByText('Clínica Polanco').length).toBeGreaterThan(0))
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
    const gateway = fakeGateway()
    render(<BookingFlow gateway={gateway} providerUserId="prov-1" now={new Date(2026, 8, 11)} />)

    // Step 0: clinic
    await waitFor(() => expect(gateway.listLocationServices).toHaveBeenCalledWith('prov-1', 'loc-1'))
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
    await user.click(screen.getByText('Confirmar cita'))

    await waitFor(() => expect(gateway.requestOtp).toHaveBeenCalledWith('+525512345678'))
    await waitFor(() => expect(screen.getByLabelText('Código de verificación')).toBeInTheDocument())

    await user.type(screen.getByLabelText('Código de verificación'), '123456')
    await user.click(screen.getByText('Verificar y confirmar'))

    await waitFor(() => expect(screen.getByText('Tu cita quedó agendada')).toBeInTheDocument())
    expect(screen.getByText(APPOINTMENT.publicRef)).toBeInTheDocument()
    expect(gateway.createAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ startsAt: '2026-09-15T16:15:00Z', serviceIds: ['svc-1'] }),
      expect.any(String),
    )
  })

  it('sends the flow back to the schedule step on a 409 slot conflict', async () => {
    const user = userEvent.setup()
    const gateway = fakeGateway({
      createAppointment: vi.fn().mockRejectedValue(new ApiError({ status: 409, code: 'SLOT_CONFLICT' })),
    })

    render(<BookingFlow gateway={gateway} providerUserId="prov-1" now={new Date(2026, 8, 11)} />)

    await waitFor(() => expect(gateway.listLocationServices).toHaveBeenCalledWith('prov-1', 'loc-1'))
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
