import { TextTag } from '../../atoms/TextTag'

export interface TrailSkillListProps {
  skills: string[]
}

export function TrailSkillList({ skills }: TrailSkillListProps) {
  return (
    <div className="trail-skill-list" aria-label="Tecnologias da trilha">
      {skills.map((skill) => (
        <TextTag key={skill} size="sm" variant="subtle">
          {skill}
        </TextTag>
      ))}
    </div>
  )
}
