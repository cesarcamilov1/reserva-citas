import styles from './ConfirmRow.module.css'

interface ConfirmRowProps {
  label: string
  value: string
  meta: string
  onEdit: () => void
}

export function ConfirmRow({ label, value, meta, onEdit }: ConfirmRowProps) {
  return (
    <div className={styles.row}>
      <div className={styles.label}>{label}</div>
      <div className={styles.body}>
        <div className={styles.value}>{value}</div>
        {meta && <div className={styles.meta}>{meta}</div>}
      </div>
      <button type="button" className={styles.edit} onClick={onEdit}>
        Editar
      </button>
    </div>
  )
}
