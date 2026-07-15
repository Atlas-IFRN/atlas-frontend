import {
  TechIcon,
  TechTag,
  getTechnologyMeta,
} from '../../atoms/TechTag'
import type { TrailSkill } from '../../../types/tracks'

export interface TrailSkillListProps {
  skills: TrailSkill[]
}

export function TrailSkillList({ skills }: TrailSkillListProps) {
  const visibleSkills = skills.slice(0, 4)
  const remainingSkills = Math.max(0, skills.length - visibleSkills.length)

  return (
    <div className="trail-skill-list" aria-label="Tecnologias da trilha">
      {visibleSkills.map((skill) => {
        const { accentColor, category, iconName } = getTechnologyMeta(skill)

        return (
          <TechTag
            accentColor={accentColor}
            category={category}
            icon={iconName ? <TechIcon name={iconName} /> : undefined}
            key={skill.id}
            variant="solid"
          >
            {skill.name}
          </TechTag>
        )
      })}
      {remainingSkills > 0 ? (
        <TechTag
          aria-label={`Mais ${remainingSkills} tecnologias`}
          category="tool"
          variant="outline"
        >
          +{remainingSkills}
        </TechTag>
      ) : null}
    </div>
  )
}
