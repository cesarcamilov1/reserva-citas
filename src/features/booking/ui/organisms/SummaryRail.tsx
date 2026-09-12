import { useState } from 'react'
import { CalendarIcon, ChevronDownIcon, LocationIcon, StethoscopeIcon } from '../atoms/icons'
import { SummaryItem } from '../molecules/SummaryItem'
import styles from './SummaryRail.module.css'

export interface SummaryData {
  clinic: { title: string; subtitle: string; active: boolean }
  service: { title: string; subtitle: string; active: boolean }
  when: { title: string; subtitle: string; active: boolean }
}

interface SummaryRailProps {
  summary: SummaryData
}

export function SummaryRail({ summary }: SummaryRailProps) {
  const [open, setOpen] = useState(false)

  const items = [
    { icon: <LocationIcon size={18} />, ...summary.clinic },
    { icon: <StethoscopeIcon size={18} />, ...summary.service },
    { icon: <CalendarIcon size={18} />, ...summary.when },
  ]

  const oneLineSummary = items
    .filter((item) => item.active)
    .map((item) => item.title)
    .join(' · ') || 'Sin selección todavía'

  return (
    <div className={styles.rail}>
      <div className={styles.intro}>
        <div className={styles.introTitle}>Agenda tu cita</div>
        <div className={styles.introText}>Cuatro pasos y te llega la confirmación al WhatsApp.</div>
      </div>

      <div className={styles.desktopVariant}>
        <div className={styles.desktopBox}>
          <div className={styles.eyebrow}>Tu selección</div>
          {items.map((item) => (
            <SummaryItem key={item.title + item.subtitle} icon={item.icon} title={item.title} subtitle={item.subtitle} active={item.active} />
          ))}
        </div>
      </div>

      <div className={styles.tabletVariant}>
        <div className={styles.tabletStrip}>
          {items.map((item) => (
            <div className={styles.tabletItem} key={item.title + item.subtitle}>
              <SummaryItem icon={item.icon} title={item.title} subtitle={item.subtitle} active={item.active} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.mobileVariant}>
        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <span className={styles.mobileLine}>{oneLineSummary}</span>
          <ChevronDownIcon size={16} className={[styles.mobileChevron, open ? styles.mobileChevronOpen : ''].filter(Boolean).join(' ')} />
        </button>
        {open && (
          <div className={styles.mobilePanel}>
            {items.map((item) => (
              <SummaryItem key={item.title + item.subtitle} icon={item.icon} title={item.title} subtitle={item.subtitle} active={item.active} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
