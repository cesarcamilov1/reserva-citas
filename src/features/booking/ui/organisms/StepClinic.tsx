import type { Location } from '../../application/ports/PublicBookingGateway'
import { SelectField } from '../atoms/SelectField'
import { LocationIcon } from '../atoms/icons'
import { StepHeading } from './StepHeading'
import styles from './StepClinic.module.css'

interface StepClinicProps {
  clinicId: string
  locations: Location[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onSelectClinic: (clinicId: string) => void
}

export function StepClinic({ clinicId, locations, loading, error, onRetry, onSelectClinic }: StepClinicProps) {
  const selected = locations.find((location) => location.id === clinicId) ?? null

  return (
    <div className={styles.step}>
      <StepHeading
        title="¿Dónde te queda mejor?"
        subtitle="Elige el consultorio al que quieres asistir. La disponibilidad cambia según la sede."
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

      {!loading && !error && (
        <SelectField
          id="sede"
          label="Dirección del consultorio"
          value={clinicId}
          onChange={onSelectClinic}
        >
          <option value="">Selecciona una sede</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name} — {location.address}
            </option>
          ))}
        </SelectField>
      )}

      {selected && (
        <div className={styles.highlight}>
          <LocationIcon size={20} className={styles.highlightIcon} />
          <div className={styles.highlightBody}>
            <div className={styles.highlightName}>{selected.name}</div>
            <div className={styles.highlightAddress}>{selected.address}</div>
          </div>
        </div>
      )}
    </div>
  )
}
