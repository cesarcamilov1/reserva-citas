import styles from './DoctorHeader.module.css'

export function DoctorHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.avatar}>MC</div>
      <div className={styles.text}>
        <div className={styles.name}>Dra. Mariana Cázares</div>
        <div className={styles.specialty}>Medicina interna · Céd. 1234567</div>
      </div>
    </div>
  )
}
