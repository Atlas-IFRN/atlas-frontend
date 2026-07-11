import { CheckCircle2 } from 'lucide-react'

interface TrailOutcomesProps {
  outcomes: string[]
}

export function TrailOutcomes({ outcomes }: TrailOutcomesProps) {
  return (
    <section className="trail-detail-section">
      <h2>O que você vai aprender</h2>
      <ul className="trail-outcomes-list">
        {outcomes.map((outcome, index) => (
          <li className="trail-outcome-item" key={`${outcome}-${index}`}>
            <CheckCircle2 aria-hidden="true" size={16} />
            <span>{outcome}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
