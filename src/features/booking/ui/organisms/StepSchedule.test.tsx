import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { buildMonthGrid } from '../../domain/availability'
import { StepSchedule } from './StepSchedule'

describe('StepSchedule', () => {
  it('renders the calendar and the empty slots state when no day is selected', () => {
    const cells = buildMonthGrid(0, new Date(2026, 8, 11), new Set(), '')
    render(
      <StepSchedule
        monthLabel="Septiembre 2026"
        canGoPrevMonth={false}
        canGoNextMonth
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
        cells={cells}
        onSelectDay={vi.fn()}
        hasDay={false}
        slotsTitle="Horarios disponibles"
        morningSlots={[]}
        afternoonSlots={[]}
        onSelectTime={vi.fn()}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />,
    )
    expect(screen.getByText('Elige día y hora')).toBeInTheDocument()
    expect(screen.getByText(/Selecciona un día en el calendario/)).toBeInTheDocument()
  })

  it('shows a loading state', () => {
    render(
      <StepSchedule
        monthLabel="Septiembre 2026"
        canGoPrevMonth={false}
        canGoNextMonth
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
        cells={[]}
        onSelectDay={vi.fn()}
        hasDay={false}
        slotsTitle=""
        morningSlots={[]}
        afternoonSlots={[]}
        onSelectTime={vi.fn()}
        loading
        error={null}
        onRetry={vi.fn()}
      />,
    )
    expect(screen.getByText('Cargando disponibilidad…')).toBeInTheDocument()
  })

  it('renders slot buttons for the selected day', () => {
    const slot = { label: '10:15', startsAt: '2026-09-15T16:15:00Z', endsAt: '2026-09-15T17:00:00Z', selected: false }
    render(
      <StepSchedule
        monthLabel="Septiembre 2026"
        canGoPrevMonth={false}
        canGoNextMonth
        onPrevMonth={vi.fn()}
        onNextMonth={vi.fn()}
        cells={[]}
        onSelectDay={vi.fn()}
        hasDay
        slotsTitle="Martes 15"
        morningSlots={[]}
        afternoonSlots={[slot]}
        onSelectTime={vi.fn()}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />,
    )
    expect(screen.getByText('10:15')).toBeInTheDocument()
  })
})
