import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { BookableService } from '../../application/ports/PublicBookingGateway'
import { StepService } from './StepService'

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

describe('StepService', () => {
  it('renders the catalog services with formatted price and duration', () => {
    render(
      <StepService serviceId="" services={SERVICES} loading={false} error={null} onRetry={vi.fn()} onSelectService={vi.fn()} />,
    )
    expect(screen.getByText('Consulta de primera vez')).toBeInTheDocument()
    expect(screen.getByText('$900.00')).toBeInTheDocument()
    expect(screen.getByText('45 min')).toBeInTheDocument()
  })

  it('shows a loading state', () => {
    render(<StepService serviceId="" services={[]} loading error={null} onRetry={vi.fn()} onSelectService={vi.fn()} />)
    expect(screen.getByText('Cargando servicios…')).toBeInTheDocument()
  })

  it('shows an error with a retry action', () => {
    const onRetry = vi.fn()
    render(
      <StepService serviceId="" services={[]} loading={false} error="No pudimos cargar la información. Intenta de nuevo." onRetry={onRetry} onSelectService={vi.fn()} />,
    )
    screen.getByText('Reintentar').click()
    expect(onRetry).toHaveBeenCalled()
  })
})
