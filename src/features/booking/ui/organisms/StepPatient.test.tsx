import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StepPatient } from './StepPatient'

describe('StepPatient', () => {
  it('renders every patient field with a real label', () => {
    render(
      <StepPatient
        patient={{ firstName: '', lastName: '', phone: '', birthDate: '', email: '', notes: '' }}
        wantsWhatsapp
        onChangeField={vi.fn()}
        onToggleWhatsapp={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Nombre(s)')).toBeInTheDocument()
    expect(screen.getByLabelText('Apellidos')).toBeInTheDocument()
    expect(screen.getByLabelText('Celular con WhatsApp')).toBeInTheDocument()
  })
})
