import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import styles from './TextField.module.css'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  optionalLabel?: boolean
}

export function TextField({ id, label, optionalLabel, className, ...props }: TextFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label} {optionalLabel && <span className={styles.optional}>· opcional</span>}
      </label>
      <input id={id} className={[styles.input, className].filter(Boolean).join(' ')} {...props} />
    </div>
  )
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string
  label: string
  optionalLabel?: boolean
}

export function TextAreaField({ id, label, optionalLabel, className, ...props }: TextAreaFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label} {optionalLabel && <span className={styles.optional}>· opcional</span>}
      </label>
      <textarea id={id} className={[styles.textarea, className].filter(Boolean).join(' ')} {...props} />
    </div>
  )
}

interface PhoneFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function PhoneField({ id, label, value, onChange, placeholder }: PhoneFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.phoneWrap}>
        <span className={styles.phonePrefix}>+52</span>
        <input
          id={id}
          type="tel"
          className={styles.phoneInput}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  )
}
