import { DoubleCheckIcon } from '../atoms/icons'
import styles from './WhatsappBubble.module.css'

interface WhatsappBubbleProps {
  text: string
  time: string
}

export function WhatsappBubble({ text, time }: WhatsappBubbleProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.bubble}>
        <div className={styles.text}>{text}</div>
        <div className={styles.footer}>
          <span className={styles.time}>{time}</span>
          <DoubleCheckIcon size={14} color="var(--color-wa-meta)" />
        </div>
      </div>
    </div>
  )
}
