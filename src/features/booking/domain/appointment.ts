function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

/** Adds `minutes` to a "HH:MM" time string, wrapping around midnight. */
export function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number)
  const total = (hours * 60 + mins + minutes + 24 * 60) % (24 * 60)
  const endHours = Math.floor(total / 60)
  const endMinutes = total % 60
  return `${pad(endHours)}:${pad(endMinutes)}`
}

/** Deterministic booking folio derived from the selected day of month. */
export function buildFolio(dayOfMonth: number): string {
  return `MX-26-${1400 + dayOfMonth * 7}`
}
