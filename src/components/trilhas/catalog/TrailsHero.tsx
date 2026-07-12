import { Plus } from 'lucide-react'
import { ButtonLink } from '../../atoms/ButtonLink'
import { PageHeroCopy } from '../../molecules/PageHeroCopy'

export interface TrailsHeroProps {
  canCreate: boolean
  createHref: string
}

export function TrailsHero({ canCreate, createHref }: TrailsHeroProps) {
  return (
    <section className="trails-hero" aria-labelledby="trails-page-title">
      <PageHeroCopy
        className="trails-hero__copy"
        description="Percursos organizados por área tecnológica. Cada trilha combina teoria, prática e desafios orientados."
        eyebrow="Aprendizado estruturado"
        title="Trilhas de Conhecimento"
        titleId="trails-page-title"
      />

      {canCreate ? (
        <ButtonLink
          className="trails-hero__cta"
          size="sm"
          to={createHref}
          variant="primary"
        >
          <Plus aria-hidden="true" size={16} strokeWidth={2} />
          <span>Criar trilha</span>
        </ButtonLink>
      ) : null}
    </section>
  )
}
