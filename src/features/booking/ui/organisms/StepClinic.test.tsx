import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Location } from '../../application/ports/PublicBookingGateway'
import { StepClinic } from './StepClinic'

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

describe('StepClinic', () => {
  it('renders the clinic select and heading once loaded', () => {
    render(
      <StepClinic clinicId="" locations={LOCATIONS} loading={false} error={null} onRetry={vi.fn()} onSelectClinic={vi.fn()} />,
    )
    expect(screen.getByText('¿Dónde te queda mejor?')).toBeInTheDocument()
    expect(screen.getByLabelText('Dirección del consultorio')).toBeInTheDocument()
    expect(screen.getByText(/Clínica Polanco/)).toBeInTheDocument()
  })

  it('shows a loading state', () => {
    render(<StepClinic clinicId="" locations={[]} loading error={null} onRetry={vi.fn()} onSelectClinic={vi.fn()} />)
    expect(screen.getByText('Cargando sedes…')).toBeInTheDocument()
  })

  it('shows an error with a retry action', () => {
    const onRetry = vi.fn()
    render(
      <StepClinic clinicId="" locations={[]} loading={false} error="No pudimos cargar la información. Intenta de nuevo." onRetry={onRetry} onSelectClinic={vi.fn()} />,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    screen.getByText('Reintentar').click()
    expect(onRetry).toHaveBeenCalled()
  })
})
