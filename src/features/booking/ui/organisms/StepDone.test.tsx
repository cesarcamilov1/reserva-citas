import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StepDone } from './StepDone'

function baseProps() {
  return {
    doneLine: 'Te esperamos martes 22 de septiembre a las 10:15 h en Clínica Polanco.',
    publicRef: 'ref-'.padEnd(32, '0'),
    statusLabel: 'Pendiente',
    showMessage: false,
    onToggleMessage: vi.fn(),
    addedToCalendar: false,
    onToggleCalendar: vi.fn(),
    waText: 'Hola Ana, tu cita quedó agendada.',
    waTime: '09:41',
    onReset: vi.fn(),
    onCancel: vi.fn(),
    cancelling: false,
    cancelError: null,
    cancelled: false,
  }
}

describe('StepDone', () => {
  it('renders the success message and the appointment reference', () => {
    render(<StepDone {...baseProps()} />)
    expect(screen.getByText('Tu cita quedó agendada')).toBeInTheDocument()
    expect(screen.getByText('ref-'.padEnd(32, '0'))).toBeInTheDocument()
    expect(screen.getByText(/Pendiente/)).toBeInTheDocument()
  })

  it('offers a cancel action that is disabled while cancelling', () => {
    const onCancel = vi.fn()
    render(<StepDone {...baseProps()} onCancel={onCancel} />)
    const button = screen.getByText('Cancelar cita')
    button.click()
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows a cancelled state and hides the cancel action once cancelled', () => {
    render(<StepDone {...baseProps()} cancelled />)
    expect(screen.getByText('Tu cita fue cancelada')).toBeInTheDocument()
    expect(screen.queryByText('Cancelar cita')).not.toBeInTheDocument()
  })

  it('shows a cancel error when present', () => {
    render(<StepDone {...baseProps()} cancelError="Ese horario ya no está disponible. Elige otro horario." />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
