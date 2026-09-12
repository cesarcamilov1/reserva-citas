import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StepConfirm } from './StepConfirm'

describe('StepConfirm', () => {
  it('renders the ticket, summary rows and the whatsapp preview', () => {
    render(
      <StepConfirm
        ticketDow="mar"
        ticketDay="22"
        ticketMonth="sep"
        ticketTitle="Martes 22 de septiembre"
        ticketMeta="10:15 a 11:00 h"
        onEditWhen={vi.fn()}
        rows={[{ label: 'Servicio', value: 'Consulta de primera vez', meta: '', onEdit: vi.fn() }]}
        total="$900"
        waText="Hola Ana, tu cita quedó agendada."
        waTime="09:41"
        waPhone="+52 55 1234 5678"
      />,
    )
    expect(screen.getByText('Revisa antes de confirmar')).toBeInTheDocument()
    expect(screen.getByText('Consulta de primera vez')).toBeInTheDocument()
    expect(screen.getByText('$900')).toBeInTheDocument()
  })
})
