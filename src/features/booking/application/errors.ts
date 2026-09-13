import { ApiError } from '../infrastructure/http/ApiError'

/** User-facing (Spanish) message for a failed read, e.g. loading locations/services/availability. */
export function describeLoadError(cause: unknown): string {
  if (cause instanceof ApiError) {
    if (cause.status === 0) {
      return 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.'
    }
    if (cause.status === 429) {
      return 'Hiciste demasiadas solicitudes. Espera un momento e intenta de nuevo.'
    }
    if (cause.status === 503) {
      return 'El servicio no está disponible en este momento. Intenta más tarde.'
    }
  }
  return 'No pudimos cargar la información. Intenta de nuevo.'
}

/** User-facing (Spanish) message for the OTP + appointment-creation flow. */
export function describeBookingError(cause: unknown): string {
  if (cause instanceof ApiError) {
    switch (cause.status) {
      case 401:
        return 'El código ingresado no es válido o ya expiró. Solicita uno nuevo.'
      case 429:
        return 'Hiciste demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
      case 409:
        return 'Ese horario ya no está disponible. Elige otro horario.'
      case 503:
        return 'El servicio no está disponible en este momento. Intenta más tarde.'
      case 0:
        return 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.'
      default:
        return 'Ocurrió un error al procesar tu solicitud. Intenta de nuevo.'
    }
  }
  return 'Ocurrió un error inesperado. Intenta de nuevo.'
}

export function isSlotConflict(cause: unknown): boolean {
  return cause instanceof ApiError && cause.status === 409
}
