import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StepService } from './StepService'

describe('StepService', () => {
  it('renders all catalog services', () => {
    render(<StepService serviceId="" onSelectService={vi.fn()} />)
    expect(screen.getByText('Consulta de primera vez')).toBeInTheDocument()
    expect(screen.getByText('Valoración nutricional')).toBeInTheDocument()
  })
})
