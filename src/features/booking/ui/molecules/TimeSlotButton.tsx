import styles from './TimeSlotButton.module.css'

interface TimeSlotButtonProps {
  label: string
  taken: boolean
  selected: boolean
  onSelect: (label: string) => void
}

export function TimeSlotButton({ label, taken, selected, onSelect }: TimeSlotButtonProps) {
  const classes = [styles.slot, taken ? styles.taken : '', selected ? styles.selected : '']
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={classes}
      disabled={taken}
      aria-pressed={selected}
      onClick={() => onSelect(label)}
    >
      {label}
    </button>
  )
}
