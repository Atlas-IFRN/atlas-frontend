import { Plus } from 'lucide-react'
import { ButtonLink } from '../../atoms/ButtonLink'

export interface TrailsHeroProps {
  createHref: string
}

export function TrailsHero({ createHref }: TrailsHeroProps) {
  return (
    <section className="trails-hero" aria-labelledby="trails-page-title">
      <div className="trails-hero__copy">
        <span className="trails-hero__eyebrow">Aprendizado estruturado</span>
        <h1 id="trails-page-title">Trilhas de Conhecimento</h1>
        <p>
          Percursos organizados por área tecnológica. Cada trilha combina
          teoria, prática e desafios orientados.
        </p>
      </div>

      <ButtonLink
        className="trails-hero__cta"
        size="sm"
        to={createHref}
        variant="primary"
      >
        <Plus aria-hidden="true" size={16} strokeWidth={2} />
        <span>Criar trilha</span>
      </ButtonLink>
    </section>
  )
}
