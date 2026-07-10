import { UserRound } from 'lucide-react'
import type { TrailTeacher } from '../../../types/tracks'

interface TrailProfessorBlockProps {
  teacher: TrailTeacher
}

export function TrailProfessorBlock({ teacher }: TrailProfessorBlockProps) {
  return (
    <section className="trail-detail-section trail-professor-block">
      <span className="trail-professor-block__avatar" aria-hidden="true">
        {teacher.initials || <UserRound size={18} />}
      </span>
      <div>
        <h2>{teacher.name}</h2>
        <p>{teacher.area}</p>
        <p>{teacher.bio}</p>
      </div>
    </section>
  )
}
