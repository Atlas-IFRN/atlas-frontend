export interface SegmentedProgressProps {
  /** Total de módulos (nº de segmentos). */
  modules: number
  /** Módulos totalmente concluídos. */
  completedModules: number
  /** Progresso (0-100) do módulo em andamento. */
  currentModuleProgress?: number
  /** Percentual real da trilha; quando informado, prevalece no preenchimento. */
  progressPercent?: number
}

function clamp(value: number, max: number) {
  return Math.min(max, Math.max(0, value))
}

/**
 * Barra de progresso fragmentada: um segmento por módulo. Módulos concluídos
 * ficam cheios; o módulo em andamento é preenchido proporcionalmente aos
 * conteúdos concluídos.
 */
export function SegmentedProgress({
  modules,
  completedModules,
  currentModuleProgress = 0,
  progressPercent,
}: SegmentedProgressProps) {
  const total = Math.max(0, modules)
  const done = clamp(completedModules, total)
  const currentFill = clamp(currentModuleProgress, 100)

  const calculatedOverall =
    total === 0 ? 0 : ((done + currentFill / 100) / total) * 100
  const overall = Math.round(
    progressPercent === undefined
      ? calculatedOverall
      : clamp(progressPercent, 100),
  )

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={overall}
      className="segmented-progress"
      data-completed={overall >= 100}
      role="progressbar"
    >
      {Array.from({ length: total }, (_, index) => {
        let fill = 0

        if (progressPercent !== undefined && total > 0) {
          const progressAcrossSegments = (clamp(progressPercent, 100) / 100) * total
          fill = clamp((progressAcrossSegments - index) * 100, 100)
        } else if (index < done) {
          fill = 100
        } else if (index === done) {
          fill = currentFill
        }

        return (
          <span className="segmented-progress__seg" key={index}>
            <span
              className="segmented-progress__fill"
              style={{ inlineSize: `${fill}%` }}
            />
          </span>
        )
      })}
    </div>
  )
}
