import styles from './StepHeading.module.css'

interface StepHeadingProps {
  title: string
  subtitle: string
}

export function StepHeading({ title, subtitle }: StepHeadingProps) {
  return (
    <div className={styles.heading}>
      <div className={styles.title}>{title}</div>
      <div className={styles.subtitle}>{subtitle}</div>
    </div>
  )
}
