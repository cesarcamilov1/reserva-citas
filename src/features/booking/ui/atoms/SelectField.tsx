import type { ReactNode } from 'react'
import { ChevronDownIcon } from './icons'
import styles from './SelectField.module.css'

interface SelectFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}

export function SelectField({ id, label, value, onChange, children }: SelectFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.wrap}>
        <select
          id={id}
          className={styles.select}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {children}
        </select>
        <ChevronDownIcon size={18} className={styles.chevron} />
      </div>
    </div>
  )
}
