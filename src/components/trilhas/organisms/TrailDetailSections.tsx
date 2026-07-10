import { Link } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Lock,
  UserRound,
  XCircle,
} from 'lucide-react'
import { ProgressBar } from '../../atoms/ProgressBar'
import { StatusBadge } from '../../atoms/StatusBadge'
import { TextTag } from '../../atoms/TextTag'
import type { Trail, TrailModule, TrailTeacher } from '../types'

export type TrailDetailTab = 'overview' | 'modules'

interface TrailBreadcrumbProps {
  title: string
}

interface TrailDetailHeroProps {
  trail: Trail
}

interface TrailDetailTabsProps {
  activeTab: TrailDetailTab
  onTabChange: (tab: TrailDetailTab) => void
}

interface TrailDetailSidebarProps {
  trail: Trail
}

interface TrailModulesPanelProps {
  modules: TrailModule[]
}

interface TrailOutcomesProps {
  outcomes: string[]
}

interface TrailPrerequisitesProps {
  prerequisites: string[]
}

interface TrailProfessorBlockProps {
  teacher: TrailTeacher
}

interface TrailEvaluationCardProps {
  evaluation: Trail['evaluation']
}

function getEvaluationStatus(status: string) {
  const normalizedStatus = status
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')

  if (normalizedStatus.includes('aprov')) {
    return 'approved'
  }

  if (normalizedStatus.includes('reprov') || normalizedStatus.includes('reject')) {
    return 'rejected'
  }

  return 'pending'
}

export function TrailBreadcrumb({ title }: TrailBreadcrumbProps) {
  return (
    <nav className="trail-breadcrumb" aria-label="Breadcrumb">
      <Link to="/trilhas">Trilhas</Link>
      <span aria-hidden="true">/</span>
      <strong>{title}</strong>
    </nav>
  )
}

export function TrailDetailHero({ trail }: TrailDetailHeroProps) {
  return (
    <section className={`trail-detail-hero ${trail.theme}`}>
      <div className="trail-detail-hero__content">
        <div className="trail-detail-hero__badges">
          <TextTag size="sm">{trail.area}</TextTag>
          {trail.isNew ? (
            <StatusBadge status="primary" size="sm">
              Nova
            </StatusBadge>
          ) : null}
        </div>
        <h1>{trail.title}</h1>
        <p>{trail.description}</p>
        <div className="trail-detail-hero__skills">
          {trail.skills.map((skill) => (
            <TextTag key={skill} size="sm" variant="subtle">
              {skill}
            </TextTag>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TrailDetailTabs({
  activeTab,
  onTabChange,
}: TrailDetailTabsProps) {
  return (
    <div className="trail-detail-tabs" role="tablist" aria-label="Detalhes">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'overview'}
        className={activeTab === 'overview' ? 'active' : undefined}
        onClick={() => onTabChange('overview')}
      >
        Visão geral
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'modules'}
        className={activeTab === 'modules' ? 'active' : undefined}
        onClick={() => onTabChange('modules')}
      >
        Módulos
      </button>
    </div>
  )
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

export function TrailEvaluationCard({ evaluation }: TrailEvaluationCardProps) {
  if (!evaluation) {
    return (
      <section className="trail-detail-section">
        <h2>Avaliação</h2>
        <p>
          Nenhuma avaliação automatizada foi registrada para esta trilha ainda.
        </p>
      </section>
    )
  }

  return (
    <section className="trail-detail-section trail-evaluation-card">
      <div className="trail-evaluation-card__header">
        <h2>Última avaliação IA</h2>
        <StatusBadge status={getEvaluationStatus(evaluation.status)} size="sm">
          {evaluation.status}
        </StatusBadge>
      </div>

      <div className="trail-evaluation-card__score">
        <strong>{evaluation.score}</strong>
        <span>/100</span>
      </div>

      <dl className="trail-evaluation-card__meta">
        <div>
          <dt>Desafio avaliado</dt>
          <dd>{evaluation.challenge}</dd>
        </div>
        <div>
          <dt>Módulo</dt>
          <dd>{evaluation.module}</dd>
        </div>
      </dl>

      <div className="trail-evaluation-card__counts">
        <span>{evaluation.attended} atendidos</span>
        <span>{evaluation.pending} pendentes</span>
        <span>{evaluation.criteria} critérios</span>
      </div>

      {evaluation.checks.length > 0 ? (
        <ul className="trail-evaluation-card__checks">
          {evaluation.checks.map((check) => (
            <li key={check.label} data-status={check.status}>
              {check.status === 'danger' ? (
                <XCircle aria-hidden="true" size={14} />
              ) : (
                <CheckCircle2 aria-hidden="true" size={14} />
              )}
              <span>{check.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
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

export function TrailOutcomes({ outcomes }: TrailOutcomesProps) {
  return (
    <section className="trail-detail-section">
      <h2>O que você vai construir</h2>
      <ul className="trail-detail-check-list">
        {outcomes.map((outcome) => (
          <li key={outcome}>
            <CheckCircle2 aria-hidden="true" size={16} />
            <span>{outcome}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function TrailPrerequisites({
  prerequisites,
}: TrailPrerequisitesProps) {
  return (
    <section className="trail-detail-section">
      <h2>Pré-requisitos</h2>
      <ul className="trail-detail-check-list">
        {prerequisites.map((prerequisite) => (
          <li key={prerequisite}>
            <CheckCircle2 aria-hidden="true" size={16} />
            <span>{prerequisite}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function TrailProfessorBlock({ teacher }: TrailProfessorBlockProps) {
  return (
    <section className="trail-detail-section trail-professor-block">
      <span className="trail-professor-block__avatar" aria-hidden="true">
        {teacher.initials || <UserRound size={18} />}
      </span>
      <div>
        <h2>{teacher.name}</h2>
        <p>{teacher.area}</p>
        <p>{teacher.bio}</p>
      </div>
    </section>
  )
}
