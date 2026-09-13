import styles from './ServiceCard.module.css'

interface ServiceCardProps {
  name: string
  description?: string
  priceLabel: string
  durationLabel: string
  selected: boolean
  onSelect: () => void
}

export function ServiceCard({ name, description, priceLabel, durationLabel, selected, onSelect }: ServiceCardProps) {
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
        <span className={styles.name}>{name}</span>
        {description && <span className={styles.desc}>{description}</span>}
      </span>
      <span className={styles.meta}>
        <span className={styles.price}>{priceLabel}</span>
        <span className={styles.duration}>{durationLabel}</span>
      </span>
    </button>
  )
}
