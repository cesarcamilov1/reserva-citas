import { describe, expect, it } from 'vitest'
import { newIdempotencyKey } from './PublicBookingGateway'

describe('newIdempotencyKey', () => {
  it('generates a UUID-shaped key within the 16-200 char server bound', () => {
    const key = newIdempotencyKey()

    expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    expect(key.length).toBeGreaterThanOrEqual(16)
    expect(key.length).toBeLessThanOrEqual(200)
  })

  it('generates a new key on every call', () => {
    expect(newIdempotencyKey()).not.toBe(newIdempotencyKey())
  })
})
