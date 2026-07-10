import { CheckCircle2 } from 'lucide-react'

interface TrailPrerequisitesProps {
  prerequisites: string[]
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
