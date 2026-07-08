import { Avatar } from '../../atoms/Avatar'
import type { TrailTeacher } from '../types'
import { TrailDetailSection } from '../molecules/TrailDetailSection'

interface TrailProfessorBlockProps {
  teacher: TrailTeacher
}

export function TrailProfessorBlock({ teacher }: TrailProfessorBlockProps) {
  return (
    <TrailDetailSection className="trail-professor-section">
      <Avatar color="blue" name={teacher.name} size="lg" />
      <div>
        <span className="trail-detail-eyebrow">Professor orientador</span>
        <h2>{teacher.name}</h2>
        <p className="trail-professor-section__area">{teacher.area}</p>
        <p>{teacher.bio}</p>
      </div>
    </TrailDetailSection>
  )
}
