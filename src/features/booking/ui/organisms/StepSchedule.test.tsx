import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { buildMonthGrid } from '../../domain/availability'
import { StepSchedule } from './StepSchedule'

describe('StepSchedule', () => {
  it('renders the calendar and the empty slots state when no day is selected', () => {
    const cells = buildMonthGrid(0, null, '')
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
      />,
    )
    expect(screen.getByText('Elige día y hora')).toBeInTheDocument()
    expect(screen.getByText(/Selecciona un día en el calendario/)).toBeInTheDocument()
  })
})
