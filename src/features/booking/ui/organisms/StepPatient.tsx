import type { PatientInfo } from '../../domain/types'
import { CheckIcon } from '../atoms/icons'
import { PhoneField, TextAreaField, TextField } from '../atoms/TextField'
import { StepHeading } from './StepHeading'
import styles from './StepPatient.module.css'

interface StepPatientProps {
  patient: PatientInfo
  wantsWhatsapp: boolean
  onChangeField: <K extends keyof PatientInfo>(field: K, value: PatientInfo[K]) => void
  onToggleWhatsapp: () => void
}

export function StepPatient({ patient, wantsWhatsapp, onChangeField, onToggleWhatsapp }: StepPatientProps) {
  return (
    <div className={styles.step}>
      <StepHeading title="Datos del paciente" subtitle="Con esto abrimos tu expediente y te enviamos la confirmación." />

      <div className={styles.grid}>
        <TextField
          id="nom"
          label="Nombre(s)"
          placeholder="Ana Lucía"
          value={patient.firstName}
          onChange={(e) => onChangeField('firstName', e.target.value)}
        />
        <TextField
          id="ape"
          label="Apellidos"
          placeholder="Ramírez Ortega"
          value={patient.lastName}
          onChange={(e) => onChangeField('lastName', e.target.value)}
        />

        <PhoneField
          id="tel"
          label="Celular con WhatsApp"
          placeholder="55 1234 5678"
          value={patient.phone}
          onChange={(value) => onChangeField('phone', value)}
        />
        <TextField
          id="nac"
          label="Fecha de nacimiento"
          placeholder="DD / MM / AAAA"
          value={patient.birthDate}
          onChange={(e) => onChangeField('birthDate', e.target.value)}
        />

        <div className={styles.span2}>
          <TextField
            id="mail"
            label="Correo"
            optionalLabel
            type="email"
            placeholder="ana.ramirez@correo.com"
            value={patient.email}
            onChange={(e) => onChangeField('email', e.target.value)}
          />
        </div>

        <div className={styles.span2}>
          <TextAreaField
            id="mot"
            label="Motivo de la consulta"
            optionalLabel
            rows={3}
            placeholder="Cuéntale a la doctora qué te trae a consulta."
            value={patient.notes}
            onChange={(e) => onChangeField('notes', e.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        className={[styles.waToggle, wantsWhatsapp ? styles.waToggleActive : ''].filter(Boolean).join(' ')}
        onClick={onToggleWhatsapp}
        aria-pressed={wantsWhatsapp}
      >
        <span className={[styles.waCheckbox, wantsWhatsapp ? styles.waCheckboxActive : ''].filter(Boolean).join(' ')}>
          <CheckIcon size={12} color="var(--color-surface)" strokeWidth={3} className={[styles.waCheckmark, wantsWhatsapp ? styles.waCheckmarkVisible : ''].filter(Boolean).join(' ')} />
        </span>
        <span className={styles.waText}>
          <span className={styles.waTitle}>Enviar confirmación y recordatorio por WhatsApp</span>
          <span className={styles.waSubtitle}>Un mensaje ahora y otro 24 horas antes de la cita. Nada de publicidad.</span>
        </span>
      </button>
    </div>
  )
}
