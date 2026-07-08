import type { KeyboardEvent } from 'react'
import { ArrowRight, Clock3, GraduationCap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../atoms/Button'
import {
  TechIcon,
  TechTag,
  techIconColors,
  type TechIconName,
  type TechTagCategory,
} from '../../atoms/TechTag'
import type { Scholarship, ScholarshipStatus } from '../../../types/scholarships'
import './ScholarshipCard.css'

export interface ScholarshipCardProps {
  scholarship: Scholarship
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  maximumFractionDigits: 0,
  style: 'currency',
})

const deadlineFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

const statusLabels: Record<ScholarshipStatus, string> = {
  Closed: 'Encerrada',
  Draft: 'Rascunho',
  Open: 'Vagas abertas',
  RegistrationClosed: 'Inscrições encerradas',
}

const technologyMetaByName: Record<
  string,
  { category: TechTagCategory; icon: TechIconName }
> = {
  angular: { category: 'framework', icon: 'angular' },
  c: { category: 'language', icon: 'c' },
  'c++': { category: 'language', icon: 'c-plus-plus' },
  docker: { category: 'infra', icon: 'docker' },
  figma: { category: 'tool', icon: 'figma' },
  git: { category: 'tool', icon: 'git' },
  go: { category: 'language', icon: 'go' },
  java: { category: 'language', icon: 'java' },
  kubernetes: { category: 'infra', icon: 'kubernetes' },
  mongodb: { category: 'infra', icon: 'mongodb' },
  'mongo db': { category: 'infra', icon: 'mongodb' },
  mqtt: { category: 'tool', icon: 'apache-kafka' },
  'next.js': { category: 'framework', icon: 'nextjs' },
  nextjs: { category: 'framework', icon: 'nextjs' },
  'node.js': { category: 'framework', icon: 'nodejs' },
  nodejs: { category: 'framework', icon: 'nodejs' },
  postgresql: { category: 'infra', icon: 'postgresql' },
  postgres: { category: 'infra', icon: 'postgresql' },
  postman: { category: 'tool', icon: 'postman' },
  python: { category: 'language', icon: 'python' },
  'raspberry pi': { category: 'infra', icon: 'raspberry-pi' },
  react: { category: 'framework', icon: 'react' },
  redis: { category: 'infra', icon: 'redis' },
  rust: { category: 'language', icon: 'rust' },
  spring: { category: 'framework', icon: 'spring' },
  tensorflow: { category: 'framework', icon: 'tensorflow' },
  typescript: { category: 'language', icon: 'typescript' },
  vite: { category: 'tool', icon: 'vite' },
  vue: { category: 'framework', icon: 'vue' },
}

function getTechnologyMeta(name: string) {
  return technologyMetaByName[name.trim().toLowerCase()]
}

function formatDeadline(deadline: string | null) {
  if (!deadline) {
    return null
  }

  const date = new Date(deadline)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return deadlineFormatter.format(date).replace('.', '')
}

function formatRequirement(scholarship: Scholarship) {
  const period = `${scholarship.minimumPeriod}º período`
  const ira = scholarship.minimumIra.toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 1,
  })

  return `A partir do ${period} · IRA ≥ ${ira}`
}

export function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const navigate = useNavigate()
  const deadline = formatDeadline(scholarship.registrationEnd)
  const detailsPath = `/bolsas/${scholarship.id}`
  const goToDetails = () => navigate(detailsPath)
  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      goToDetails()
    }
  }

  return (
    <article
      aria-label={`Ver detalhes da bolsa ${scholarship.title}`}
      className="atlas-scholarship-card"
      onClick={goToDetails}
      onKeyDown={handleCardKeyDown}
      role="link"
      tabIndex={0}
    >
      <div className="atlas-scholarship-card__main">
        <div className="atlas-scholarship-card__meta">
          <span
            className="atlas-scholarship-card__status"
            data-status={scholarship.status}
          >
            {statusLabels[scholarship.status]}
          </span>

          {deadline ? (
            <span className="atlas-scholarship-card__deadline">
              <Clock3 aria-hidden="true" size={15} strokeWidth={1.9} />
              até {deadline}
            </span>
          ) : null}
        </div>

        <div className="atlas-scholarship-card__content">
          <h2>{scholarship.title}</h2>

          <p>{scholarship.description}</p>
        </div>

        {scholarship.technologies.length > 0 ? (
          <ul className="atlas-scholarship-card__tags" aria-label="Tecnologias">
            {scholarship.technologies.slice(0, 6).map((technology) => {
              const meta = getTechnologyMeta(technology.name)

              return (
                <li key={technology.id}>
                  <TechTag
                    accentColor={meta ? techIconColors[meta.icon] : undefined}
                    category={meta?.category ?? 'tool'}
                    icon={meta ? <TechIcon name={meta.icon} /> : undefined}
                    variant="solid"
                  >
                    {technology.name}
                  </TechTag>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>

      <div className="atlas-scholarship-card__footer">
        <dl className="atlas-scholarship-card__stats">
          <div>
            <dt>Mês</dt>
            <dd>
              <span>{currencyFormatter.format(scholarship.valuePerMonth)}</span>
              <small>/</small>
            </dd>
          </div>

          <div>
            <dt>Duração</dt>
            <dd>
              <span>{scholarship.durationInMonths}</span>
              <small> meses</small>
            </dd>
          </div>

          <div>
            <dt>Abertas</dt>
            <dd>
              <span>{scholarship.vacancies}</span>
              <small> vagas</small>
            </dd>
          </div>
        </dl>

        <div className="atlas-scholarship-card__action-area">
          <Button
            className="atlas-scholarship-card__button"
            iconRight={ArrowRight}
            onClick={(event) => {
              event.stopPropagation()
              goToDetails()
            }}
            size="md"
          >
            Ver detalhes
          </Button>

          <span className="atlas-scholarship-card__requirement">
            <GraduationCap aria-hidden="true" size={15} strokeWidth={1.9} />
            {formatRequirement(scholarship)}
          </span>
        </div>
      </div>
    </article>
  )
}
