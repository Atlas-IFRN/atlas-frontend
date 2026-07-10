import { CheckCircle2 } from 'lucide-react'

interface TrailOutcomesProps {
  outcomes: string[]
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
