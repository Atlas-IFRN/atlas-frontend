import {
  Briefcase,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ButtonLink } from '../../atoms/ButtonLink'
import { IconTile, type IconTileVariant } from '../../atoms/IconTile'
import type { ActiveScholarship, ScholarshipPhase } from '../types'

interface ActiveScholarshipsProps {
  scholarships: ActiveScholarship[]
  seeAllHref?: string
}

/** Cor do ícone por fase da bolsa (verde / âmbar / azul). */
const phaseVariant: Record<ScholarshipPhase, IconTileVariant> = {
  inscricao: 'success',
  andamento: 'warning',
  resultados: 'primary',
}

/** Ícone por fase da bolsa. */
const phaseIcon: Record<ScholarshipPhase, LucideIcon> = {
  inscricao: CalendarPlus,
  andamento: CalendarClock,
  resultados: CalendarCheck,
}

/** Bloco "Bolsas Ativas" com prazos próximos, exibido na coluna esquerda. */
export function ActiveScholarships({
  scholarships,
  seeAllHref = '/bolsas',
}: ActiveScholarshipsProps) {
  return (
    <section className="rail-block">
      <h2 className="rail-block__label">Bolsas Ativas</h2>

      <ul className="scholarship-list">
        {scholarships.map((scholarship) => (
          <li key={scholarship.id}>
            <Link className="scholarship-item" to={scholarship.href}>
              <IconTile
                aria-hidden="true"
                className="scholarship-item__tile"
                icon={phaseIcon[scholarship.phase]}
                size="md"
                variant={phaseVariant[scholarship.phase]}
              />

              <div className="scholarship-item__body">
                <span className="scholarship-item__title">
                  {scholarship.title}
                </span>
                <span className="scholarship-item__meta">
                  {scholarship.status}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <ButtonLink
        className="rail-block__cta"
        size="sm"
        to={seeAllHref}
        variant="soft"
      >
        <Briefcase aria-hidden="true" size={16} strokeWidth={2} />
        <span>Ver todas as bolsas</span>
      </ButtonLink>
    </section>
  )
}
