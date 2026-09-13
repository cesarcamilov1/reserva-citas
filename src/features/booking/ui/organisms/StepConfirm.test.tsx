import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StepConfirm } from './StepConfirm'

function baseProps() {
  return {
    ticketDow: 'mar',
    ticketDay: '22',
    ticketMonth: 'sep',
    ticketTitle: 'Martes 22 de septiembre',
    ticketMeta: '10:15 a 11:00 h',
    onEditWhen: vi.fn(),
    rows: [{ label: 'Servicio', value: 'Consulta de primera vez', meta: '', onEdit: vi.fn() }],
    total: '$900.00',
    waText: 'Hola Ana, tu cita quedó agendada.',
    waTime: '09:41',
    waPhone: '+52 55 1234 5678',
    otpCode: '',
    onChangeOtpCode: vi.fn(),
    onResendCode: vi.fn(),
    otpError: null,
  }
}

describe('StepConfirm', () => {
  it('renders the ticket, summary rows and the whatsapp preview', () => {
    render(<StepConfirm {...baseProps()} otpPhase="idle" />)
    expect(screen.getByText('Revisa antes de confirmar')).toBeInTheDocument()
    expect(screen.getByText('Consulta de primera vez')).toBeInTheDocument()
    expect(screen.getByText('$900.00')).toBeInTheDocument()
  })

  it('does not show the OTP input before a code has been requested', () => {
    render(<StepConfirm {...baseProps()} otpPhase="idle" />)
    expect(screen.queryByLabelText('Código de verificación')).not.toBeInTheDocument()
  })

  it('shows the OTP input and resend link once a code has been sent', () => {
    render(<StepConfirm {...baseProps()} otpPhase="otpSent" />)
    expect(screen.getByLabelText('Código de verificación')).toBeInTheDocument()
    expect(screen.getByText('Reenviar código')).toBeInTheDocument()
  })

  it('shows an OTP error message when present', () => {
    render(<StepConfirm {...baseProps()} otpPhase="otpSent" otpError="El código ingresado no es válido o ya expiró." />)
    expect(screen.getByRole('alert')).toHaveTextContent('El código ingresado no es válido')
  })
})
