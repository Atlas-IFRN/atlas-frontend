import type { CSSProperties } from 'react'
import { BookOpen, Check, FileText, Play, Video } from 'lucide-react'
import { StatusBadge } from '../../atoms/StatusBadge'
import type { TrailLessonType, TrailModule } from '../types'

interface TrailModulesPanelProps {
  modules: TrailModule[]
}

type ModuleStatus = 'completed' | 'in-progress' | 'inactive'

const moduleStatusLabels: Record<ModuleStatus, string> = {
  completed: 'Concluído',
  'in-progress': 'Em andamento',
  inactive: 'Não iniciado',
}

function getModuleProgress(module: TrailModule) {
  if (module.lessons === 0) {
    return 0
  }

  return Math.round((module.completedLessons / module.lessons) * 100)
}

function getModuleStatus(module: TrailModule): ModuleStatus {
  const progress = getModuleProgress(module)

  if (progress >= 100 && module.lessons > 0) {
    return 'completed'
  }

  if (progress > 0) {
    return 'in-progress'
  }

  return 'inactive'
}

function countLessonsByType(module: TrailModule, type: TrailLessonType) {
  return module.lessonsList.filter((lesson) => lesson.type === type).length
}

function formatLessonCount(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`
}

function formatDuration(minutes: number | null) {
  if (!minutes) {
    return null
  }

  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}min`
    : `${hours}h`
}

export function TrailModulesPanel({ modules }: TrailModulesPanelProps) {
  return (
    <section className="trail-modules-panel" aria-labelledby="trail-modules-title">
      <h2 id="trail-modules-title">Conteúdo do módulo ({modules.length})</h2>

      <div className="trail-modules-list">
        {modules.map((module, index) => {
          const progress = getModuleProgress(module)
          const status = getModuleStatus(module)
          const videoCount =
            countLessonsByType(module, 'VIDEO') || module.lessons
          const documentCount = module.lessonsList.filter(
            (lesson) => lesson.type !== 'VIDEO',
          ).length
          const progressStyle = {
            '--trail-module-progress': `${progress}%`,
          } as CSSProperties

          return (
            <details
              className="trail-module-card"
              key={module.id}
              open={index === 0}
            >
              <summary className="trail-module-card__summary">
                <span className="trail-module-card__icon" aria-hidden="true">
                  <BookOpen size={22} strokeWidth={1.8} />
                </span>

                <span className="trail-module-card__content">
                  <span className="trail-module-card__title-row">
                    <strong>{module.title}</strong>
                    <StatusBadge size="sm" status={status}>
                      {moduleStatusLabels[status]}
                    </StatusBadge>
                  </span>

                  <span className="trail-module-card__progress-copy">
                    <strong>
                      {module.completedLessons}/{module.lessons}
                    </strong>
                    <span>aulas</span>
                    <span aria-hidden="true">·</span>
                    <strong>{progress}%</strong>
                    <span>concluído</span>
                  </span>
                </span>

                <span className="trail-module-card__meta">
                  <span>
                    <Video size={14} strokeWidth={1.8} aria-hidden="true" />
                    {formatLessonCount(videoCount, 'vídeo', 'vídeos')}
                  </span>
                  <span>
                    <FileText size={14} strokeWidth={1.8} aria-hidden="true" />
                    {formatLessonCount(documentCount, 'doc', 'docs')}
                  </span>
                </span>

                <span
                  className="trail-module-card__indicator"
                  data-status={status}
                  style={progressStyle}
                  aria-hidden="true"
                >
                  {status === 'completed' ? (
                    <Check size={18} strokeWidth={2.4} />
                  ) : null}
                  {status === 'in-progress' ? <span>{progress}%</span> : null}
                  {status === 'inactive' ? (
                    <Play size={16} fill="currentColor" strokeWidth={0} />
                  ) : null}
                </span>
              </summary>

              {module.lessonsList.length > 0 ? (
                <ul className="trail-module-lessons" aria-label={module.title}>
                  {module.lessonsList.map((lesson) => {
                    const duration = formatDuration(lesson.durationMinutes)

                    return (
                      <li className="trail-module-lesson" key={lesson.id}>
                        <span
                          className="trail-module-lesson__status"
                          data-completed={lesson.completed}
                          aria-hidden="true"
                        >
                          {lesson.completed ? (
                            <Check size={14} strokeWidth={2.4} />
                          ) : (
                            <Play size={12} fill="currentColor" strokeWidth={0} />
                          )}
                        </span>
                        <span>{lesson.title}</span>
                        {duration ? <time>{duration}</time> : null}
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </details>
          )
        })}
      </div>
    </section>
  )
}
