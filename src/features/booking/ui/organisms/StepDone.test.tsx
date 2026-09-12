import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StepDone } from './StepDone'

describe('StepDone', () => {
  it('renders the success message and folio', () => {
    render(
      <StepDone
        doneLine="Te esperamos martes 22 de septiembre a las 10:15 h en Clínica Polanco."
        folio="MX-26-1554"
        showMessage={false}
        onToggleMessage={vi.fn()}
        addedToCalendar={false}
        onToggleCalendar={vi.fn()}
        waText="Hola Ana, tu cita quedó agendada."
        waTime="09:41"
        onReset={vi.fn()}
      />,
    )
    expect(screen.getByText('Tu cita quedó agendada')).toBeInTheDocument()
    expect(screen.getByText('MX-26-1554')).toBeInTheDocument()
  })
})
