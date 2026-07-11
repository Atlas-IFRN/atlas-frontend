import { PrereqItem } from '../molecules/PrereqItem'
import { TrailDetailSection } from '../molecules/TrailDetailSection'

interface TrailPrerequisitesProps {
  prerequisites: string[]
}

export function TrailPrerequisites({
  prerequisites,
}: TrailPrerequisitesProps) {
  return (
    <TrailDetailSection title="Pré-requisitos">
      <ul className="trail-prereq-list">
        {prerequisites.map((prerequisite, index) => (
          <PrereqItem key={`${prerequisite}-${index}`}>{prerequisite}</PrereqItem>
        ))}
      </ul>
    </TrailDetailSection>
  )
}
