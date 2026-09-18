import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

const CATALOG = Array.from({ length: 39 }, (_, index) => ({
  ...SERVICES[0],
  id: `svc-${index + 1}`,
  name: index === 38 ? 'Revisión de oído' : `Servicio ${index + 1}`,
}))

const DEFAULT_PROPS = { serviceId: '', services: CATALOG, loading: false, error: null, onRetry: vi.fn(), onSelectService: vi.fn() }

describe('StepService', () => {
  it('renders the catalog services with formatted price and duration', () => {
    render(
      <StepService serviceId="" services={SERVICES} loading={false} error={null} onRetry={vi.fn()} onSelectService={vi.fn()} />,
    )
    expect(screen.getByText('Consulta de primera vez')).toBeInTheDocument()
    expect(screen.queryByText('Historia clínica completa')).not.toBeInTheDocument()
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

  it('shows six cards at a time and makes all 39 services reachable', async () => {
    const user = userEvent.setup()
    const onSelectService = vi.fn()
    render(<StepService {...DEFAULT_PROPS} onSelectService={onSelectService} />)
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()

    for (let page = 0; page < 7; page += 1) {
      const cards = screen.getAllByRole('button', { pressed: false })
      expect(cards).toHaveLength(page === 6 ? 3 : 6)
      expect(screen.getByRole('status')).toHaveTextContent(`Mostrando ${page * 6 + 1}–${Math.min(page * 6 + 6, 39)} de 39 servicios`)
      for (const [index, card] of cards.entries()) {
        await user.click(card)
        expect(onSelectService).toHaveBeenLastCalledWith(`svc-${page * 6 + index + 1}`)
      }
      if (page < 6) await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    }

    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(screen.getByText('Página 6 de 7')).toBeInTheDocument()
  })

  it('searches without case or accents and resets the page', async () => {
    const user = userEvent.setup()
    render(<StepService {...DEFAULT_PROPS} />)
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    await user.type(screen.getByRole('searchbox', { name: 'Buscar servicio' }), ' REVISION DE OIDO ')
    expect(screen.getByRole('button', { name: /Revisión de oído/ })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Mostrando 1–1 de 1 servicio')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    expect(screen.getByRole('searchbox')).toHaveValue('')
    expect(screen.getByText('Página 1 de 7')).toBeInTheDocument()
  })

  it('distinguishes no matches from an empty catalog and clears the query', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<StepService {...DEFAULT_PROPS} />)
    await user.type(screen.getByRole('searchbox'), 'inexistente')
    expect(screen.getByRole('status')).toHaveTextContent('No encontramos servicios con esa búsqueda.')
    expect(screen.queryAllByRole('button', { pressed: false })).toHaveLength(0)
    await user.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(6)
    rerender(<StepService {...DEFAULT_PROPS} services={[]} />)
    expect(screen.getByText('No hay servicios disponibles en esta sede.')).toBeInTheDocument()
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
  })

  it('retains selection across filters and pages without an extra selected-service panel', async () => {
    const user = userEvent.setup()
    function ControlledService() {
      const [serviceId, setServiceId] = useState('')
      return <StepService {...DEFAULT_PROPS} serviceId={serviceId} onSelectService={setServiceId} />
    }
    render(<ControlledService />)
    await user.click(screen.getByRole('button', { name: /^Servicio 1 \$/ }))
    expect(screen.getByRole('button', { name: /^Servicio 1 \$/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('Servicio seleccionado')).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Servicio seleccionado' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    await user.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(screen.getByRole('button', { name: /^Servicio 1 \$/ })).toHaveAttribute('aria-pressed', 'true')
    await user.type(screen.getByRole('searchbox'), 'inexistente')
    expect(screen.queryByText('Servicio seleccionado')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    expect(screen.getByRole('button', { name: /^Servicio 1 \$/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('clamps pagination when the catalog shrinks', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<StepService {...DEFAULT_PROPS} />)
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    rerender(<StepService {...DEFAULT_PROPS} services={CATALOG.slice(0, 8)} />)
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Mostrando 7–8 de 8 servicios')
    expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(2)
  })

  it('supports keyboard search and card selection without exposing descriptions', async () => {
    const user = userEvent.setup()
    const onSelectService = vi.fn()
    render(<StepService {...DEFAULT_PROPS} onSelectService={onSelectService} />)
    await user.tab()
    expect(screen.getByRole('searchbox')).toHaveFocus()
    await user.keyboard('revision')
    await user.tab()
    expect(screen.getByRole('button', { name: 'Limpiar búsqueda' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: /Revisión de oído/ })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onSelectService).toHaveBeenCalledWith('svc-39')
    expect(screen.queryByText(SERVICES[0].description!)).not.toBeInTheDocument()
  })
})
