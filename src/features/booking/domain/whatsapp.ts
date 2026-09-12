export interface WhatsappMessageInput {
  firstName: string
  serviceName: string
  longDate: string
  time: string
  clinicName: string
  clinicAddress: string
}

/**
 * Builds the confirmation WhatsApp message shown in the design's preview.
 * Degrades to neutral placeholders when a field hasn't been chosen yet.
 */
export function buildWhatsappMessage(input: WhatsappMessageInput): string {
  const greeting = input.firstName
    ? `Hola ${input.firstName}, tu cita quedó agendada.`
    : 'Hola, tu cita quedó agendada.'

  const serviceLine = input.serviceName || 'Consulta'

  const whenLine = input.longDate
    ? `${input.longDate} a las ${input.time || '--:--'} h`
    : 'Fecha por confirmar'

  const clinicLine = input.clinicName
    ? `${input.clinicName}${input.clinicAddress ? ` — ${input.clinicAddress}` : ''}`
    : 'Sede por confirmar'

  return [
    greeting,
    '',
    serviceLine,
    whenLine,
    clinicLine,
    '',
    'Llega 10 minutos antes con una identificación oficial.',
    'Responde REAGENDAR o CANCELAR si necesitas moverla.',
  ].join('\n')
}
