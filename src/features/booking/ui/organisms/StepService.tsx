import type { BookableService } from '../../application/ports/PublicBookingGateway'
import { formatDurationMinutes, formatPriceMXN } from '../../domain/formatting'
import { ServiceCard } from '../molecules/ServiceCard'
import { StepHeading } from './StepHeading'
import styles from './StepService.module.css'

interface StepServiceProps {
  serviceId: string
  services: BookableService[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onSelectService: (serviceId: string) => void
}

export function StepService({ serviceId, services, loading, error, onRetry, onSelectService }: StepServiceProps) {
  return (
    <div className={styles.step}>
      <StepHeading
        title="¿Qué necesitas atender?"
        subtitle="Los precios y la duración son de referencia. Se confirman al llegar al consultorio."
      />

      {loading && <div className={styles.status}>Cargando servicios…</div>}

      {!loading && error && (
        <div className={styles.status} role="alert">
          {error}
          <button type="button" className={styles.retryButton} onClick={onRetry}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className={styles.list}>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              name={service.name}
              description={service.description}
              priceLabel={formatPriceMXN(service.defaultPrice)}
              durationLabel={formatDurationMinutes(service.durationMinutes)}
              selected={service.id === serviceId}
              onSelect={() => onSelectService(service.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
