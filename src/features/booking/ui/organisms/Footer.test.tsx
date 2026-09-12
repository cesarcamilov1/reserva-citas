import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Footer } from './Footer'

describe('Footer', () => {
  it('disables the next button when the step is invalid', () => {
    render(<Footer canGoBack={false} onBack={vi.fn()} hint="" nextLabel="Continuar" nextDisabled onNext={vi.fn()} />)
    expect(screen.getByText('Continuar').closest('button')).toBeDisabled()
  })
})
