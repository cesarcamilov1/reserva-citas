import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadEnv } from './env'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('loadEnv', () => {
  it('defaults apiBaseUrl to same-origin when unset', () => {
    vi.stubEnv('VITE_API_BASE_URL', '')

    expect(loadEnv().apiBaseUrl).toBe('')
  })

  it('reads VITE_API_BASE_URL and VITE_PROVIDER_USER_ID when set', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    vi.stubEnv('VITE_PROVIDER_USER_ID', 'prov-1')

    const env = loadEnv()

    expect(env.apiBaseUrl).toBe('https://api.example.com')
    expect(env.providerUserId).toBe('prov-1')
  })
})
