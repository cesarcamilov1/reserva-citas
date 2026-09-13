import type { TimeSlot } from '../../domain/types'
import styles from './TimeSlotButton.module.css'

interface TimeSlotButtonProps {
  slot: TimeSlot
  onSelect: (slot: TimeSlot) => void
}

export function TimeSlotButton({ slot, onSelect }: TimeSlotButtonProps) {
  const classes = [styles.slot, slot.selected ? styles.selected : ''].filter(Boolean).join(' ')

  return (
    <button type="button" className={classes} aria-pressed={slot.selected} onClick={() => onSelect(slot)}>
      {slot.label}
    </button>
  )
}
