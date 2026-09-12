import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StepClinic } from './StepClinic'

describe('StepClinic', () => {
  it('renders the clinic select and heading', () => {
    render(<StepClinic clinicId="" clinic={null} onSelectClinic={vi.fn()} />)
    expect(screen.getByText('¿Dónde te queda mejor?')).toBeInTheDocument()
    expect(screen.getByLabelText('Dirección del consultorio')).toBeInTheDocument()
  })
})
