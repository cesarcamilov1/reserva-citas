import type { Clinic, ClinicId } from '../../domain/types'
import { SelectField } from '../atoms/SelectField'
import { LocationIcon } from '../atoms/icons'
import { StepHeading } from './StepHeading'
import styles from './StepClinic.module.css'

interface StepClinicProps {
  clinicId: ClinicId | ''
  clinic: Clinic | null
  onSelectClinic: (clinicId: ClinicId) => void
}

export function StepClinic({ clinicId, clinic, onSelectClinic }: StepClinicProps) {
  return (
    <div className={styles.step}>
      <StepHeading
        title="¿Dónde te queda mejor?"
        subtitle="Elige el consultorio al que quieres asistir. La disponibilidad cambia según la sede."
      />

      <SelectField id="sede" label="Dirección del consultorio" value={clinicId} onChange={(value) => onSelectClinic(value as ClinicId)}>
        <option value="">Selecciona una sede</option>
        <option value="polanco">Clínica Polanco — Av. Horacio 1855</option>
        <option value="roma">Consultorio Roma Norte — Orizaba 101</option>
        <option value="satelite">Centro Médico Satélite — Ávila Camacho 3130</option>
        <option value="video">Videoconsulta — desde donde estés</option>
      </SelectField>

      {clinic && (
        <div className={styles.highlight}>
          <LocationIcon size={20} className={styles.highlightIcon} />
          <div className={styles.highlightBody}>
            <div className={styles.highlightName}>{clinic.name}</div>
            <div className={styles.highlightAddress}>{clinic.address}</div>
            <div className={styles.highlightMeta}>{clinic.meta}</div>
          </div>
        </div>
      )}
    </div>
  )
}
