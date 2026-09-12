import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Stepper } from './Stepper'

describe('Stepper', () => {
  it('marks the active step with aria-current and shows the mobile progress label', () => {
    render(<Stepper step={1} reached={1} done={false} onSelectStep={vi.fn()} />)
    const current = screen.getAllByText('Servicio')[0].closest('button')
    expect(current).toHaveAttribute('aria-current', 'step')
    expect(screen.getByText('Paso 2 de 5')).toBeInTheDocument()
  })
})
