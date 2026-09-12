import { StepperStep } from '../molecules/StepperStep'
import type { StepIndex } from '../../domain/types'
import styles from './Stepper.module.css'

const STEP_LABELS = ['Sede', 'Servicio', 'Horario', 'Datos', 'Confirmar']

interface StepperProps {
  step: StepIndex
  reached: StepIndex
  done: boolean
  onSelectStep: (step: StepIndex) => void
}

export function Stepper({ step, reached, done, onSelectStep }: StepperProps) {
  const currentLabel = STEP_LABELS[step]
  const progressPercent = ((step + 1) / STEP_LABELS.length) * 100

  return (
    <>
      <div className={styles.desktopStepper}>
        {STEP_LABELS.map((label, index) => (
          <StepperStep
            key={label}
            index={index}
            label={label}
            isCurrent={!done && index === step}
            isPast={done || index < step}
            isOpen={index <= reached}
            showBar={index > 0}
            onSelect={() => onSelectStep(index as StepIndex)}
          />
        ))}
      </div>

      <div className={styles.mobileStepper}>
        <div className={styles.mobileLabelRow}>
          <span className={styles.mobileStepLabel}>
            Paso {step + 1} de {STEP_LABELS.length}
          </span>
          <span className={styles.mobileStepName}>{currentLabel}</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    </>
  )
}
