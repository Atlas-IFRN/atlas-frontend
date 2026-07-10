import { Check } from 'lucide-react'

interface OutcomeItemProps {
  children: string
}

export function OutcomeItem({ children }: OutcomeItemProps) {
  return (
    <li className="trail-outcome-item">
      <Check aria-hidden="true" size={18} strokeWidth={2.3} />
      <span>{children}</span>
    </li>
  )
}
