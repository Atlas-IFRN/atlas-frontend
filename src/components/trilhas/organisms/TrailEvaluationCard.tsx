import { Star } from 'lucide-react'

const evaluationSteps = [
  'Resolva o desafio',
  'Envie o repositório',
  'Receba feedback da IA',
  'Competência validada',
]

export function TrailEvaluationCard() {
  return (
    <section className="trail-evaluation-card">
      <span className="trail-evaluation-card__icon" aria-hidden="true">
        <Star size={26} strokeWidth={1.9} />
      </span>

      <div className="trail-evaluation-card__content">
        <span className="trail-detail-eyebrow">Diferencial ATLAS</span>
        <h2>Avaliação automatizada por IA</h2>
        <p>
          A cada desafio, você envia o link do repositório no GitHub. Uma IA
          analisa o código com base nos critérios definidos pelo professor
          orientador, devolve feedback técnico detalhado e gera uma pontuação
          que entra no seu perfil do Banco de Talentos do NADIC.
        </p>

        <ol className="trail-evaluation-card__steps">
          {evaluationSteps.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
