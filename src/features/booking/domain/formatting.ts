const priceFormatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

/** Formats a decimal price string (e.g. "450.00") as MXN currency, e.g. "$450.00". */
export function formatPriceMXN(decimalPrice: string): string {
  const amount = Number(decimalPrice)
  if (Number.isNaN(amount)) return decimalPrice
  return priceFormatter.format(amount)
}

/** Formats a duration in minutes as a short human label, e.g. "45 min". */
export function formatDurationMinutes(minutes: number): string {
  return `${minutes} min`
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  ARRIVED: 'Paciente en el consultorio',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No se presentó',
}

/** Spanish label for an appointment status. */
export function formatAppointmentStatus(status: string): string {
  return STATUS_LABELS[status] ?? status
}
