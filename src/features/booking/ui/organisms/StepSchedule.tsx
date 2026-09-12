import type { CalendarCell, TimeSlot } from '../../domain/types'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '../atoms/icons'
import { DayCell } from '../molecules/DayCell'
import { TimeSlotButton } from '../molecules/TimeSlotButton'
import { StepHeading } from './StepHeading'
import styles from './StepSchedule.module.css'

const WEEKDAY_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

interface StepScheduleProps {
  monthLabel: string
  canGoPrevMonth: boolean
  canGoNextMonth: boolean
  onPrevMonth: () => void
  onNextMonth: () => void
  cells: CalendarCell[]
  onSelectDay: (dayKey: string) => void
  hasDay: boolean
  slotsTitle: string
  morningSlots: TimeSlot[]
  afternoonSlots: TimeSlot[]
  onSelectTime: (time: string) => void
}

export function StepSchedule({
  monthLabel,
  canGoPrevMonth,
  canGoNextMonth,
  onPrevMonth,
  onNextMonth,
  cells,
  onSelectDay,
  hasDay,
  slotsTitle,
  morningSlots,
  afternoonSlots,
  onSelectTime,
}: StepScheduleProps) {
  return (
    <div className={styles.step}>
      <StepHeading
        title="Elige día y hora"
        subtitle="Horario del centro de México (GMT-6). Solo ves los espacios libres."
      />

      <div className={styles.layout}>
        <div className={styles.calendarPane}>
          <div className={styles.calendarHead}>
            <div className={styles.monthLabel}>{monthLabel}</div>
            <div className={styles.monthNav}>
              <button type="button" className={styles.navButton} onClick={onPrevMonth} disabled={!canGoPrevMonth} aria-label="Mes anterior">
                <ChevronLeftIcon size={16} />
              </button>
              <button type="button" className={styles.navButton} onClick={onNextMonth} disabled={!canGoNextMonth} aria-label="Mes siguiente">
                <ChevronRightIcon size={16} />
              </button>
            </div>
          </div>

          <div className={styles.weekRow}>
            {WEEKDAY_HEADERS.map((day) => (
              <div className={styles.weekday} key={day}>
                {day}
              </div>
            ))}
          </div>

          <div className={styles.grid}>
            {cells.map((cell, index) => (
              <DayCell key={cell.dayKey || `blank-${index}`} cell={cell} onSelect={onSelectDay} />
            ))}
          </div>

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={styles.legendSwatch} />
              <span className={styles.legendLabel}>Con espacio</span>
            </div>
            <div className={styles.legendItem}>
              <span className={[styles.legendSwatch, styles.legendSwatchClosed].join(' ')} />
              <span className={styles.legendLabel}>Sin espacio</span>
            </div>
          </div>
        </div>

        <div className={styles.slotsPane}>
          <div className={styles.slotsTitle}>{slotsTitle}</div>

          {!hasDay && (
            <div className={styles.emptyState}>
              <CalendarIcon size={22} />
              <div className={styles.emptyText}>
                Selecciona un día en el calendario
                <br />
                para ver los horarios disponibles.
              </div>
            </div>
          )}

          {hasDay && (
            <>
              <div className={styles.slotGroup}>
                <div className={styles.slotGroupLabel}>Mañana</div>
                <div className={styles.slotGrid}>
                  {morningSlots.map((slot) => (
                    <TimeSlotButton key={slot.label} label={slot.label} taken={slot.taken} selected={slot.selected} onSelect={onSelectTime} />
                  ))}
                </div>
              </div>
              <div className={styles.slotGroup}>
                <div className={styles.slotGroupLabel}>Tarde</div>
                <div className={styles.slotGrid}>
                  {afternoonSlots.map((slot) => (
                    <TimeSlotButton key={slot.label} label={slot.label} taken={slot.taken} selected={slot.selected} onSelect={onSelectTime} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
