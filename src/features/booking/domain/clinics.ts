import type { Clinic, ClinicId } from './types'

export const CLINICS: Record<ClinicId, Clinic> = {
  polanco: {
    id: 'polanco',
    name: 'Clínica Polanco',
    address: 'Av. Horacio 1855, Col. Polanco, CDMX',
    meta: 'Lunes a viernes · 8:00 a 20:00 h',
    openOnSaturday: false,
  },
  roma: {
    id: 'roma',
    name: 'Consultorio Roma Norte',
    address: 'Calle Orizaba 101, Roma Norte, CDMX',
    meta: 'Lunes a sábado · 9:00 a 18:00 h',
    openOnSaturday: true,
  },
  satelite: {
    id: 'satelite',
    name: 'Centro Médico Satélite',
    address: 'Blvd. Manuel Ávila Camacho 3130, Naucalpan',
    meta: 'Lunes a viernes · 7:00 a 15:00 h',
    openOnSaturday: false,
  },
  video: {
    id: 'video',
    name: 'Videoconsulta',
    address: 'Te enviamos el enlace de la videollamada por WhatsApp',
    meta: 'Todos los días · 8:00 a 21:00 h',
    openOnSaturday: true,
  },
}

export const CLINIC_LIST: Clinic[] = Object.values(CLINICS)

export function getClinic(id: ClinicId | ''): Clinic | null {
  if (!id) return null
  return CLINICS[id] ?? null
}
