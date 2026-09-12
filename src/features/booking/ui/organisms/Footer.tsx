import { ChevronLeftIcon, ChevronRightIcon } from '../atoms/icons'
import styles from './Footer.module.css'

interface FooterProps {
  canGoBack: boolean
  onBack: () => void
  hint: string
  nextLabel: string
  nextDisabled: boolean
  onNext: () => void
}

export function Footer({ canGoBack, onBack, hint, nextLabel, nextDisabled, onNext }: FooterProps) {
  return (
    <div className={styles.footer}>
      <button
        type="button"
        className={[styles.back, !canGoBack ? styles.backDisabled : ''].filter(Boolean).join(' ')}
        onClick={onBack}
        disabled={!canGoBack}
      >
        <ChevronLeftIcon size={16} />
        Atrás
      </button>
      <div className={styles.right}>
        {hint && <div className={styles.hint}>{hint}</div>}
        <button type="button" className={styles.next} onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
          <ChevronRightIcon size={16} />
        </button>
      </div>
    </div>
  )
}
