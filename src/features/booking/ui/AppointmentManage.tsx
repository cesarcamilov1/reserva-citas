import { useAppointmentManage } from '../application/useAppointmentManage'
import type { PublicBookingGateway } from '../application/ports/PublicBookingGateway'
import { formatAppointmentStatus } from '../domain/formatting'
import { Button } from './atoms/Button'
import styles from './AppointmentManage.module.css'

interface AppointmentManageProps {
  gateway: PublicBookingGateway
  publicRef: string
}

export function AppointmentManage({ gateway, publicRef }: AppointmentManageProps) {
  const { appointment, loading, notFound, error, confirming, cancelling, actionError, confirm, cancel, retry } =
    useAppointmentManage(gateway, publicRef)

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>Cargando tu cita…</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>Cita no encontrada</div>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className={styles.page}>
        <div className={styles.card} role="alert">
          {error ?? 'No pudimos cargar tu cita. Intenta de nuevo.'}
          <Button variant="secondary" onClick={retry}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  const canConfirm = appointment.status === 'PENDING'
  const canCancel = appointment.status === 'PENDING' || appointment.status === 'CONFIRMED'
  const start = new Date(appointment.startsAt)

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Tu cita</h1>
        <p className={styles.reference}>Referencia: {appointment.publicRef}</p>
        <p className={styles.status}>Estado: {formatAppointmentStatus(appointment.status)}</p>
        <p className={styles.when}>
          {start.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })} ·{' '}
          {start.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} h
        </p>

        {actionError && (
          <p className={styles.error} role="alert">
            {actionError}
          </p>
        )}

        <div className={styles.actions}>
          <Button onClick={confirm} disabled={!canConfirm || confirming}>
            {confirming ? 'Confirmando…' : 'Confirmar'}
          </Button>
          <Button variant="secondary" onClick={cancel} disabled={!canCancel || cancelling}>
            {cancelling ? 'Cancelando…' : 'Cancelar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
