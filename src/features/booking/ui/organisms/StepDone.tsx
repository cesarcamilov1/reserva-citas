import { CalendarIcon, CheckIcon, WhatsappIcon } from '../atoms/icons'
import { WhatsappBubble } from '../molecules/WhatsappBubble'
import styles from './StepDone.module.css'

interface StepDoneProps {
  doneLine: string
  folio: string
  showMessage: boolean
  onToggleMessage: () => void
  addedToCalendar: boolean
  onToggleCalendar: () => void
  waText: string
  waTime: string
  onReset: () => void
}

export function StepDone({
  doneLine,
  folio,
  showMessage,
  onToggleMessage,
  addedToCalendar,
  onToggleCalendar,
  waText,
  waTime,
  onReset,
}: StepDoneProps) {
  return (
    <div className={styles.step}>
      <div className={styles.iconCircle}>
        <CheckIcon size={28} strokeWidth={2} />
      </div>
      <div className={styles.textBlock}>
        <div className={styles.title}>Tu cita quedó agendada</div>
        <div className={styles.subtitle}>{doneLine}</div>
      </div>
      <div className={styles.folio}>
        <span className={styles.folioLabel}>Folio</span>
        <span className={styles.folioValue}>{folio}</span>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.msgButton} onClick={onToggleMessage}>
          <WhatsappIcon size={17} color="var(--color-surface)" />
          {showMessage ? 'Ocultar el mensaje' : 'Abrir el mensaje'}
        </button>
        <button
          type="button"
          className={[styles.calButton, addedToCalendar ? styles.calButtonActive : ''].filter(Boolean).join(' ')}
          onClick={onToggleCalendar}
        >
          <CalendarIcon size={17} />
          {addedToCalendar ? 'Agregado al calendario' : 'Agregar al calendario'}
        </button>
      </div>

      {showMessage && (
        <div className={styles.previewWrap}>
          <WhatsappBubble text={waText} time={waTime} />
        </div>
      )}

      <button type="button" className={styles.resetLink} onClick={onReset}>
        Agendar otra cita
      </button>
    </div>
  )
}
