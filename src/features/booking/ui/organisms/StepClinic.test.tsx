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
      <StepClinic clinicId="loc-1" locations={LOCATIONS} loading={false} error={null} onRetry={vi.fn()} onSelectClinic={vi.fn()} />,
    )
    expect(screen.getByText('¿Dónde te queda mejor?')).toBeInTheDocument()
    expect(screen.getByLabelText('Dirección del consultorio')).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Selecciona una sede' })).not.toBeInTheDocument()
    const option = screen.getByRole('option', { name: /^Clínica Polanco$/ })
    expect(option).toHaveTextContent(/^Clínica Polanco$/)
    expect(option).not.toHaveTextContent(LOCATIONS[0].address)
  })

  it('keeps the selected clinic name and address visible outside the select', () => {
    render(
      <StepClinic clinicId="loc-1" locations={LOCATIONS} loading={false} error={null} onRetry={vi.fn()} onSelectClinic={vi.fn()} />,
    )

    expect(screen.getByRole('combobox')).toHaveValue('loc-1')
    expect(screen.getAllByText('Clínica Polanco')).toHaveLength(2)
    expect(screen.getByText(LOCATIONS[0].address)).toBeInTheDocument()
  })

  it('shows a loading state', () => {
    render(<StepClinic clinicId="" locations={[]} loading error={null} onRetry={vi.fn()} onSelectClinic={vi.fn()} />)
    expect(screen.getByText('Cargando sedes…')).toBeInTheDocument()
  })

  it('explains an empty catalog without showing an empty select', () => {
    render(<StepClinic clinicId="" locations={[]} loading={false} error={null} onRetry={vi.fn()} onSelectClinic={vi.fn()} />)
    expect(screen.getByText('No hay sedes disponibles por el momento.')).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
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
