import { OutcomeItem } from '../molecules/OutcomeItem'
import { TrailDetailSection } from '../molecules/TrailDetailSection'

interface TrailOutcomesProps {
  outcomes: string[]
}

export function TrailOutcomes({ outcomes }: TrailOutcomesProps) {
  return (
    <TrailDetailSection title="O que você vai aprender">
      <ul className="trail-outcomes-list">
        {outcomes.map((outcome, index) => (
          <OutcomeItem key={`${outcome}-${index}`}>{outcome}</OutcomeItem>
        ))}
      </ul>
    </TrailDetailSection>
  )
}
