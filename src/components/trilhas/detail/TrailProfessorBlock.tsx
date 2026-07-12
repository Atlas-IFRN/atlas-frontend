import { Avatar } from '../../atoms/Avatar'
import type { TrailTeacher } from '../../../types/tracks'

interface TrailProfessorBlockProps {
  teacher: TrailTeacher
}

export function TrailProfessorBlock({ teacher }: TrailProfessorBlockProps) {
  return (
    <section className="trail-detail-section trail-professor-section">
      <Avatar color="blue" name={teacher.name} size="md" />
      <div>
        <span className="trail-detail-eyebrow">Professor orientador</span>
        <h2>{teacher.name}</h2>
        {teacher.area ? (
          <p className="trail-professor-section__area">{teacher.area}</p>
        ) : null}
        {teacher.bio ? <p>{teacher.bio}</p> : null}
      </div>
    </section>
  )
}
