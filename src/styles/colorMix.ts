/**
 * Pure color-mixing helpers, ported from the design's inline `mixWhite` /
 * `mixBlack` logic. Used offline to derive the accent's soft/line/dark
 * variants that are then hardcoded into tokens.css (no colors are computed
 * at runtime in the app itself).
 */

type Rgb = [number, number, number]

function toRgb(hex: string): Rgb {
  const clean = hex.replace('#', '')
  const normalized = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean
  const n = Number.parseInt(normalized, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function toHex(rgb: Rgb): string {
  return `#${rgb
    .map((value) => {
      const clamped = Math.max(0, Math.min(255, Math.round(value)))
      return clamped.toString(16).padStart(2, '0')
    })
    .join('')}`.toUpperCase()
}

/** Mixes `hex` toward white by fraction `t` (0 = original color, 1 = white). */
export function mixWithWhite(hex: string, t: number): string {
  const [r, g, b] = toRgb(hex)
  return toHex([r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t])
}

/** Mixes `hex` toward black by fraction `t` (0 = original color, 1 = black). */
export function mixWithBlack(hex: string, t: number): string {
  const [r, g, b] = toRgb(hex)
  return toHex([r * (1 - t), g * (1 - t), b * (1 - t)])
}
