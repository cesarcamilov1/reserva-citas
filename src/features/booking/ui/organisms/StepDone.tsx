import { CalendarIcon, CheckIcon, WhatsappIcon } from '../atoms/icons'
import { WhatsappBubble } from '../molecules/WhatsappBubble'
import styles from './StepDone.module.css'

interface StepDoneProps {
  doneLine: string
  publicRef: string
  statusLabel: string
  showMessage: boolean
  onToggleMessage: () => void
  addedToCalendar: boolean
  onToggleCalendar: () => void
  waText: string
  waTime: string
  onReset: () => void
  onCancel: () => void
  cancelling: boolean
  cancelError: string | null
  cancelled: boolean
}

export function StepDone({
  doneLine,
  publicRef,
  statusLabel,
  showMessage,
  onToggleMessage,
  addedToCalendar,
  onToggleCalendar,
  waText,
  waTime,
  onReset,
  onCancel,
  cancelling,
  cancelError,
  cancelled,
}: StepDoneProps) {
  return (
    <div className={styles.step}>
      <div className={styles.iconCircle}>
        <CheckIcon size={28} strokeWidth={2} />
      </div>
      <div className={styles.textBlock}>
        <div className={styles.title}>{cancelled ? 'Tu cita fue cancelada' : 'Tu cita quedó agendada'}</div>
        <div className={styles.subtitle}>{doneLine}</div>
      </div>
      <div className={styles.folio}>
        <span className={styles.folioLabel}>Referencia</span>
        <span className={styles.folioValue}>{publicRef}</span>
        <span className={styles.folioLabel}>Estado: {statusLabel}</span>
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

      {!cancelled && (
        <button type="button" className={styles.cancelLink} onClick={onCancel} disabled={cancelling}>
          {cancelling ? 'Cancelando…' : 'Cancelar cita'}
        </button>
      )}
      {cancelError && (
        <p className={styles.cancelError} role="alert">
          {cancelError}
        </p>
      )}

      <button type="button" className={styles.resetLink} onClick={onReset}>
        Agendar otra cita
      </button>
    </div>
  )
}
