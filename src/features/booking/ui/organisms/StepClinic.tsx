import type { Location } from '../../application/ports/PublicBookingGateway'
import { LocationIcon } from '../atoms/icons'
import { StepHeading } from './StepHeading'
import styles from './StepClinic.module.css'

interface StepClinicProps {
  clinicId: string
  locations: Location[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function StepClinic({ clinicId, locations, loading, error, onRetry }: StepClinicProps) {
  const selected = locations.find((location) => location.id === clinicId) ?? null

  return (
    <div className={styles.step}>
      <StepHeading
        title="Consultorio"
        subtitle="Tu cita será en este consultorio."
      />

      {loading && <div className={styles.status}>Cargando sedes…</div>}

      {!loading && error && (
        <div className={styles.status} role="alert">
          {error}
          <button type="button" className={styles.retryButton} onClick={onRetry}>
            Reintentar
          </button>
        </div>
      )}

      {selected && (
        <div className={styles.highlight}>
          <LocationIcon size={20} className={styles.highlightIcon} />
          <div className={styles.highlightName}>{selected.name}</div>
        </div>
      )}
    </div>
  )
}
