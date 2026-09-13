import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../infrastructure/http/ApiError'
import type { PublicAppointment, PublicBookingGateway } from '../application/ports/PublicBookingGateway'
import { AppointmentManage } from './AppointmentManage'

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

const APPOINTMENT: PublicAppointment = {
  publicRef: 'ref-1'.padEnd(32, '0'),
  status: 'PENDING',
  startsAt: '2026-09-15T16:00:00Z',
  endsAt: '2026-09-15T16:30:00Z',
}

describe('AppointmentManage', () => {
  it('shows the appointment status and reference once loaded', async () => {
    const gateway = fakeGateway({ getAppointment: vi.fn().mockResolvedValue(APPOINTMENT) })
    render(<AppointmentManage gateway={gateway} publicRef={APPOINTMENT.publicRef} />)

    await waitFor(() => expect(screen.getByText(/Referencia/)).toBeInTheDocument())
    expect(screen.getByText(/Pendiente/)).toBeInTheDocument()
  })

  it('shows "Cita no encontrada" on a 404', async () => {
    const gateway = fakeGateway({
      getAppointment: vi.fn().mockRejectedValue(new ApiError({ status: 404, code: 'NOT_FOUND' })),
    })
    render(<AppointmentManage gateway={gateway} publicRef="missing" />)

    await waitFor(() => expect(screen.getByText('Cita no encontrada')).toBeInTheDocument())
  })

  it('confirms a pending appointment', async () => {
    const user = userEvent.setup()
    const gateway = fakeGateway({
      getAppointment: vi.fn().mockResolvedValue(APPOINTMENT),
      confirmAppointment: vi.fn().mockResolvedValue({ ...APPOINTMENT, status: 'CONFIRMED' }),
    })
    render(<AppointmentManage gateway={gateway} publicRef={APPOINTMENT.publicRef} />)

    await waitFor(() => expect(screen.getByText('Confirmar')).toBeInTheDocument())
    await user.click(screen.getByText('Confirmar'))

    await waitFor(() => expect(screen.getByText(/Confirmada/)).toBeInTheDocument())
  })

  it('disables confirm for an already-confirmed appointment but allows cancel', async () => {
    const gateway = fakeGateway({
      getAppointment: vi.fn().mockResolvedValue({ ...APPOINTMENT, status: 'CONFIRMED' }),
    })
    render(<AppointmentManage gateway={gateway} publicRef={APPOINTMENT.publicRef} />)

    await waitFor(() => expect(screen.getByText('Confirmar')).toBeInTheDocument())
    expect(screen.getByText('Confirmar')).toBeDisabled()
    expect(screen.getByText('Cancelar')).not.toBeDisabled()
  })
})
