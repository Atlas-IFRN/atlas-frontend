import { BookOpen, CheckCircle2, Clock, Lock } from 'lucide-react'
import type { TrailModule } from '../../../types/tracks'

interface TrailModulesPanelProps {
  modules: TrailModule[]
}

export function TrailModulesPanel({ modules }: TrailModulesPanelProps) {
  return (
    <section className="trail-detail-section">
      <h2>Módulos da trilha</h2>
      <div className="trail-modules-panel">
        {modules.map((module, index) => (
          <article className="trail-module-card" key={module.id}>
            <div className="trail-module-card__number">{index + 1}</div>
            <div>
              <h3>{module.title}</h3>
              <p>
                {module.completedLessons} de {module.lessons} conteúdos
              </p>
              <ul>
                {module.lessonsList.map((lesson) => (
                  <li key={lesson.id}>
                    {module.locked ? (
                      <Lock aria-hidden="true" size={14} />
                    ) : lesson.completed ? (
                      <CheckCircle2 aria-hidden="true" size={14} />
                    ) : (
                      <BookOpen aria-hidden="true" size={14} />
                    )}
                    <span>{lesson.title}</span>
                    {lesson.durationMinutes ? (
                      <small>
                        <Clock aria-hidden="true" size={13} />
                        {lesson.durationMinutes} min
                      </small>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
