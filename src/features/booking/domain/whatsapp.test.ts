import { describe, expect, it } from 'vitest'
import { buildWhatsappMessage } from './whatsapp'

describe('buildWhatsappMessage', () => {
  it('includes patient name, service, date, time and clinic address', () => {
    const message = buildWhatsappMessage({
      firstName: 'Ana Lucía',
      serviceName: 'Consulta de primera vez',
      longDate: 'martes 22 de septiembre',
      time: '10:15',
      clinicName: 'Clínica Polanco',
      clinicAddress: 'Av. Horacio 1855, Col. Polanco, CDMX',
    })

    expect(message).toContain('Ana Lucía')
    expect(message).toContain('Consulta de primera vez')
    expect(message).toContain('martes 22 de septiembre')
    expect(message).toContain('10:15')
    expect(message).toContain('Clínica Polanco')
    expect(message).toContain('Av. Horacio 1855, Col. Polanco, CDMX')
  })

  it('degrades gracefully when fields are missing', () => {
    const message = buildWhatsappMessage({
      firstName: '',
      serviceName: '',
      longDate: '',
      time: '',
      clinicName: '',
      clinicAddress: '',
    })

    expect(message).toContain('tu cita quedó agendada')
    expect(message).toContain('Fecha por confirmar')
    expect(message).toContain('Sede por confirmar')
    expect(message).not.toMatch(/undefined/)
  })
})
