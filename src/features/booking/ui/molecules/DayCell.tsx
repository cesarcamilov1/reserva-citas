import type { CalendarCell } from '../../domain/types'
import styles from './DayCell.module.css'

interface DayCellProps {
  cell: CalendarCell
  onSelect: (dayKey: string) => void
}

export function DayCell({ cell, onSelect }: DayCellProps) {
  if (cell.isBlank) {
    return <div className={[styles.cell, styles.blank].filter(Boolean).join(' ')} aria-hidden="true" />
  }

  const classes = [styles.cell, cell.isOpen ? styles.open : '', cell.isSelected ? styles.selected : '']
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={classes}
      disabled={!cell.isOpen}
      aria-pressed={cell.isSelected}
      onClick={() => onSelect(cell.dayKey)}
    >
      {cell.label}
    </button>
  )
}
