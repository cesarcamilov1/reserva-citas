import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/')
})

describe('App', () => {
  it('shows a configuration error when VITE_PROVIDER_USER_ID is missing', () => {
    vi.stubEnv('VITE_PROVIDER_USER_ID', '')

    render(<App />)

    expect(screen.getByRole('alert')).toHaveTextContent('VITE_PROVIDER_USER_ID')
  })

  it('renders the booking flow when configured and there is no ?ref', async () => {
    vi.stubEnv('VITE_PROVIDER_USER_ID', 'prov-1')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [] }), { status: 200 })))

    render(<App />)

    expect(screen.getByText('¿Dónde te queda mejor?')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByLabelText('Dirección del consultorio')).toBeInTheDocument())
  })

  it('renders the appointment manage screen when the URL has a ?ref', async () => {
    vi.stubEnv('VITE_PROVIDER_USER_ID', 'prov-1')
    window.history.replaceState(null, '', '/?ref=abc123')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ public_ref: 'abc123', status: 'PENDING', starts_at: '2026-09-15T16:00:00Z', ends_at: '2026-09-15T16:30:00Z' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    )

    render(<App />)

    expect(screen.getByText('Cargando tu cita…')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/Referencia/)).toBeInTheDocument())
  })
})
