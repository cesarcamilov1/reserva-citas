import { SERVICES } from '../../domain/services'
import type { ServiceId } from '../../domain/types'
import { ServiceCard } from '../molecules/ServiceCard'
import { StepHeading } from './StepHeading'
import styles from './StepService.module.css'

interface StepServiceProps {
  serviceId: ServiceId | ''
  onSelectService: (serviceId: ServiceId) => void
}

export function StepService({ serviceId, onSelectService }: StepServiceProps) {
  return (
    <div className={styles.step}>
      <StepHeading
        title="¿Qué necesitas atender?"
        subtitle="Los precios y la duración son de referencia. Se confirman al llegar al consultorio."
      />
      <div className={styles.list}>
        {SERVICES.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            selected={service.id === serviceId}
            onSelect={() => onSelectService(service.id)}
          />
        ))}
      </div>
    </div>
  )
}
