import { PrereqItem } from '../molecules/PrereqItem'
import { TrailDetailSection } from '../molecules/TrailDetailSection'

interface TrailPrerequisitesProps {
  prerequisites: string[]
}

export function TrailPrerequisites({
  prerequisites,
}: TrailPrerequisitesProps) {
  return (
    <TrailDetailSection title="Pré-requisitos recomendados">
      <ul className="trail-prereq-list">
        {prerequisites.map((prerequisite) => (
          <PrereqItem key={prerequisite}>{prerequisite}</PrereqItem>
        ))}
      </ul>
    </TrailDetailSection>
  )
}
