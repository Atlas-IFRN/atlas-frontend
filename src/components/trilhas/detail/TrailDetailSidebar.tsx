import { ProgressBar } from '../../atoms/ProgressBar'
import type { Trail } from '../../../types/tracks'

interface TrailDetailSidebarProps {
  trail: Trail
}

export function TrailDetailSidebar({ trail }: TrailDetailSidebarProps) {
  const progress = trail.progress ?? 0

  return (
    <aside className="trail-detail-sidebar">
      <div className="trail-detail-sidebar__card">
        <h2>Progresso</h2>
        <ProgressBar label="Conclusão" value={progress} />
      </div>

      <div className="trail-detail-sidebar__card">
        <h2>Resumo</h2>
        <dl className="trail-detail-meta">
          <div>
            <dt>Módulos</dt>
            <dd>{trail.modules}</dd>
          </div>
          <div>
            <dt>Carga</dt>
            <dd>{trail.hours}h</dd>
          </div>
          <div>
            <dt>Duração</dt>
            <dd>{trail.durationLabel}</dd>
          </div>
        </dl>
      </div>
    </aside>
  )
}
