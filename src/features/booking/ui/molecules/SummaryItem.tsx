import type { ReactNode } from 'react'
import styles from './SummaryItem.module.css'

interface SummaryItemProps {
  icon: ReactNode
  title: string
  subtitle: string
  active: boolean
}

export function SummaryItem({ icon, title, subtitle, active }: SummaryItemProps) {
  return (
    <div className={styles.item}>
      <span className={[styles.icon, active ? styles.iconActive : ''].filter(Boolean).join(' ')}>{icon}</span>
      <span className={styles.text}>
        <span className={[styles.title, active ? styles.titleActive : ''].filter(Boolean).join(' ')}>{title}</span>
        <span className={styles.subtitle}>{subtitle}</span>
      </span>
    </div>
  )
}
