import { OutcomeItem } from '../molecules/OutcomeItem'
import { TrailDetailSection } from '../molecules/TrailDetailSection'

interface TrailOutcomesProps {
  outcomes: string[]
}

export function TrailOutcomes({ outcomes }: TrailOutcomesProps) {
  return (
    <TrailDetailSection title="O que você vai aprender">
      <ul className="trail-outcomes-list">
        {outcomes.map((outcome) => (
          <OutcomeItem key={outcome}>{outcome}</OutcomeItem>
        ))}
      </ul>
    </TrailDetailSection>
  )
}
