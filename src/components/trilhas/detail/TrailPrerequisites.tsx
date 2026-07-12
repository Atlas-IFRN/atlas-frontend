interface TrailPrerequisitesProps {
  prerequisites: string[]
}

export function TrailPrerequisites({ prerequisites }: TrailPrerequisitesProps) {
  return (
    <section className="trail-detail-section">
      <h2>Pré-requisitos</h2>
      <ul className="trail-prereq-list">
        {prerequisites.map((prerequisite, index) => (
          <li className="trail-prereq-item" key={`${prerequisite}-${index}`}>
            <span aria-hidden="true" />
            {prerequisite}
          </li>
        ))}
      </ul>
    </section>
  )
}
