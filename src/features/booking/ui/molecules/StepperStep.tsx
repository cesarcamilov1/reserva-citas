import styles from './StepperStep.module.css'

interface StepperStepProps {
  index: number
  label: string
  isCurrent: boolean
  isPast: boolean
  isOpen: boolean
  showBar: boolean
  onSelect: () => void
}

export function StepperStep({ index, label, isCurrent, isPast, isOpen, showBar, onSelect }: StepperStepProps) {
  const dotClasses = [styles.dot, isCurrent ? styles.dotCurrent : isPast ? styles.dotPast : '']
    .filter(Boolean)
    .join(' ')
  const labelClasses = [styles.label, isCurrent ? styles.labelCurrent : isPast ? styles.labelPast : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.wrap}>
      {showBar && <span className={[styles.bar, isPast || isCurrent ? styles.barActive : ''].filter(Boolean).join(' ')} />}
      <button
        type="button"
        className={[styles.step, isOpen ? styles.clickable : ''].filter(Boolean).join(' ')}
        onClick={isOpen ? onSelect : undefined}
        disabled={!isOpen}
        aria-current={isCurrent ? 'step' : undefined}
      >
        <span className={dotClasses}>{index + 1}</span>
        <span className={labelClasses}>{label}</span>
      </button>
    </div>
  )
}
