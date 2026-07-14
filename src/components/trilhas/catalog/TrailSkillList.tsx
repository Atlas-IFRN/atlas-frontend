import {
  TechIcon,
  TechTag,
  techIconColors,
  type TechIconName,
  type TechTagCategory,
} from '../../atoms/TechTag'
import { techIcons } from '../../atoms/TechTag/TechIcon.colors'

export interface TrailSkillListProps {
  skills: string[]
}

function getSkillCategory(skill: string): TechTagCategory {
  const normalizedSkill = skill.trim().toLowerCase()

  if (/(python|javascript|typescript|java|go|rust|php|c#|c\+\+)/.test(normalizedSkill)) {
    return 'language'
  }

  if (/(react|django|fastapi|spring|angular|vue|next)/.test(normalizedSkill)) {
    return 'framework'
  }

  if (/(docker|postgres|mysql|kubernetes|redis|linux|aws|azure)/.test(normalizedSkill)) {
    return 'infra'
  }

  return 'tool'
}

function getSkillIconName(skill: string): TechIconName | null {
  const normalizedSkill = skill
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const aliases: Record<string, TechIconName> = {
    'c++': 'c-plus-plus',
    'django rest framework': 'django',
    drf: 'django',
    javascript: 'nodejs',
    'next.js': 'nextjs',
    'node.js': 'nodejs',
    postgres: 'postgresql',
    'react native': 'react',
  }
  const normalizedIconName = normalizedSkill
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const iconName = aliases[normalizedSkill] ?? normalizedIconName

  return iconName in techIcons ? (iconName as TechIconName) : null
}

export function TrailSkillList({ skills }: TrailSkillListProps) {
  const visibleSkills = skills.slice(0, 4)
  const remainingSkills = Math.max(0, skills.length - visibleSkills.length)

  return (
    <div className="trail-skill-list" aria-label="Tecnologias da trilha">
      {visibleSkills.map((skill) => {
        const iconName = getSkillIconName(skill)

        return (
          <TechTag
            accentColor={iconName ? techIconColors[iconName] : undefined}
            category={getSkillCategory(skill)}
            icon={iconName ? <TechIcon name={iconName} /> : undefined}
            key={skill}
            variant={iconName ? 'solid' : 'outline'}
          >
            {skill}
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
