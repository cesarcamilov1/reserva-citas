import { WhatsappIcon } from '../atoms/icons'
import { ConfirmRow } from '../molecules/ConfirmRow'
import { WhatsappBubble } from '../molecules/WhatsappBubble'
import { StepHeading } from './StepHeading'
import styles from './StepConfirm.module.css'

export interface ConfirmSummaryRow {
  label: string
  value: string
  meta: string
  onEdit: () => void
}

export type OtpPhase = 'idle' | 'sendingOtp' | 'otpSent' | 'verifying' | 'done'

interface StepConfirmProps {
  ticketDow: string
  ticketDay: string
  ticketMonth: string
  ticketTitle: string
  ticketMeta: string
  onEditWhen: () => void
  rows: ConfirmSummaryRow[]
  total: string
  waText: string
  waTime: string
  waPhone: string
  otpPhase: OtpPhase
  otpCode: string
  onChangeOtpCode: (code: string) => void
  onResendCode: () => void
  otpError: string | null
}

export function StepConfirm({
  ticketDow,
  ticketDay,
  ticketMonth,
  ticketTitle,
  ticketMeta,
  onEditWhen,
  rows,
  total,
  waText,
  waTime,
  waPhone,
  otpPhase,
  otpCode,
  onChangeOtpCode,
  onResendCode,
  otpError,
}: StepConfirmProps) {
  const showOtpInput = otpPhase === 'otpSent' || otpPhase === 'verifying'

  return (
    <div className={styles.step}>
      <StepHeading title="Revisa antes de confirmar" subtitle="Si algo no cuadra, toca Editar y vuelves justo a ese paso." />

      <div className={styles.layout}>
        <div className={styles.ticket}>
          <div className={styles.ticketHeader}>
            <div className={styles.dateBadge}>
              <div className={styles.dow}>{ticketDow}</div>
              <div className={styles.dayNum}>{ticketDay}</div>
              <div className={styles.mon}>{ticketMonth}</div>
            </div>
            <div className={styles.ticketTitleWrap}>
              <div className={styles.ticketTitle}>{ticketTitle}</div>
              <div className={styles.ticketMeta}>{ticketMeta}</div>
            </div>
            <button type="button" className={styles.changeLink} onClick={onEditWhen}>
              Cambiar
            </button>
          </div>

          {rows.map((row) => (
            <ConfirmRow key={row.label} label={row.label} value={row.value} meta={row.meta} onEdit={row.onEdit} />
          ))}

          <div className={styles.totalRow}>
            <div className={styles.totalLabel}>Total estimado</div>
            <div className={styles.totalValue}>{total}</div>
          </div>

          {showOtpInput && (
            <div className={styles.otpPanel}>
              <label htmlFor="otp" className={styles.otpLabel}>
                Código de verificación
              </label>
              <p className={styles.otpHint}>Te enviamos un código por SMS a {waPhone}.</p>
              <input
                id="otp"
                className={styles.otpInput}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={(event) => onChangeOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={otpPhase === 'verifying'}
              />
              {otpError && (
                <p className={styles.otpError} role="alert">
                  {otpError}
                </p>
              )}
              <button
                type="button"
                className={styles.resendLink}
                onClick={onResendCode}
                disabled={otpPhase === 'verifying'}
              >
                Reenviar código
              </button>
            </div>
          )}

          {!showOtpInput && otpError && (
            <p className={styles.otpError} role="alert">
              {otpError}
            </p>
          )}
        </div>

        <div className={styles.previewPane}>
          <div className={styles.previewHead}>
            <WhatsappIcon size={16} color="var(--color-muted)" />
            <div className={styles.previewLabel}>Mensaje que recibirás</div>
          </div>
          <WhatsappBubble text={waText} time={waTime} />
          <div className={styles.previewFootnote}>Se envía a {waPhone} en cuanto confirmes.</div>
        </div>
      </div>
    </div>
  )
}
