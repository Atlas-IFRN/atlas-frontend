export interface SegmentedProgressProps {
  /** Total de módulos (nº de segmentos). */
  modules: number
  /** Módulos totalmente concluídos. */
  completedModules: number
  /** Progresso (0-100) do módulo em andamento. */
  currentModuleProgress?: number
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
}: SegmentedProgressProps) {
  const total = Math.max(0, modules)
  const done = clamp(completedModules, total)
  const currentFill = clamp(currentModuleProgress, 100)

  const overall =
    total === 0 ? 0 : Math.round(((done + currentFill / 100) / total) * 100)

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={overall}
      className="segmented-progress"
      role="progressbar"
    >
      {Array.from({ length: total }, (_, index) => {
        let fill = 0

        if (index < done) {
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
