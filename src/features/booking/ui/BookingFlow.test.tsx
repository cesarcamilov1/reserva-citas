import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { BookingFlow } from './BookingFlow'

describe('BookingFlow', () => {
  it('starts on the clinic step and advances after picking a clinic', async () => {
    const user = userEvent.setup()
    render(<BookingFlow />)

    expect(screen.getByText('¿Dónde te queda mejor?')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Dirección del consultorio'), 'polanco')
    await user.click(screen.getByText('Continuar'))

    expect(screen.getByText('¿Qué necesitas atender?')).toBeInTheDocument()
  })
})
