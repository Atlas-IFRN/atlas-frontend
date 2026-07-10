interface PrereqItemProps {
  children: string
}

export function PrereqItem({ children }: PrereqItemProps) {
  return (
    <li className="trail-prereq-item">
      <span aria-hidden="true" />
      {children}
    </li>
  )
}
