import type { Service } from '../../domain/types'
import styles from './ServiceCard.module.css'

interface ServiceCardProps {
  service: Service
  selected: boolean
  onSelect: () => void
}

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={[styles.card, selected ? styles.selected : ''].filter(Boolean).join(' ')}
    >
      <span className={[styles.ring, selected ? styles.ringSelected : ''].filter(Boolean).join(' ')}>
        <span className={[styles.ringDot, selected ? styles.ringDotVisible : ''].filter(Boolean).join(' ')} />
      </span>
      <span className={styles.body}>
        <span className={styles.name}>{service.name}</span>
        <span className={styles.desc}>{service.description}</span>
      </span>
      <span className={styles.meta}>
        <span className={styles.price}>{service.price}</span>
        <span className={styles.duration}>{service.duration}</span>
      </span>
    </button>
  )
}
