import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SummaryRail } from './SummaryRail'

describe('SummaryRail', () => {
  it('renders the three summary entries', () => {
    render(
      <SummaryRail
        summary={{
          clinic: { title: 'Clínica Polanco', subtitle: 'Av. Horacio 1855', active: true },
          service: { title: 'Servicio sin elegir', subtitle: 'Paso 2', active: false },
          when: { title: 'Horario sin elegir', subtitle: 'Paso 3', active: false },
        }}
      />,
    )
    expect(screen.getAllByText('Clínica Polanco').length).toBeGreaterThan(0)
  })
})
