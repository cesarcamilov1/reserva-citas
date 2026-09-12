import type { Service, ServiceId } from './types'

function parseDurationMinutes(duration: string): number {
  const match = /\d+/.exec(duration)
  return match ? Number(match[0]) : 30
}

const RAW_SERVICES: Array<Omit<Service, 'durationMinutes'>> = [
  {
    id: 'primera',
    name: 'Consulta de primera vez',
    description: 'Historia clínica completa, exploración y plan de tratamiento.',
    price: '$900',
    duration: '45 min',
  },
  {
    id: 'seguimiento',
    name: 'Consulta de seguimiento',
    description: 'Revisión de estudios y ajuste del tratamiento en curso.',
    price: '$650',
    duration: '25 min',
  },
  {
    id: 'certificado',
    name: 'Certificado médico',
    description: 'Valoración y expedición del certificado el mismo día.',
    price: '$450',
    duration: '20 min',
  },
  {
    id: 'nutricion',
    name: 'Valoración nutricional',
    description: 'Composición corporal y plan de alimentación personalizado.',
    price: '$800',
    duration: '50 min',
  },
]

export const SERVICES: Service[] = RAW_SERVICES.map((service) => ({
  ...service,
  durationMinutes: parseDurationMinutes(service.duration),
}))

export function getService(id: ServiceId | ''): Service | null {
  if (!id) return null
  return SERVICES.find((service) => service.id === id) ?? null
}
