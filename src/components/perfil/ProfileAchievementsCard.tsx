import { Award, BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { InfoCard } from '../molecules/InfoCard'
import { PROFILE_ACHIEVEMENTS } from './profileData'

export function ProfileAchievementsCard() {
  return (
    <InfoCard
      className="profile-achievements"
      icon={<Award size={18} />}
      iconTone="success"
      title="Trilhas concluídas"
    >
      <p className="profile-achievements__description">
        Trilhas concluídas por este estudante.
      </p>

      <ul className="profile-achievements__list">
        {PROFILE_ACHIEVEMENTS.map((achievement) => (
          <li key={achievement.id}>
            <Link
              className="profile-achievement-tag"
              aria-label={`${achievement.label}, trilha concluída`}
              to={achievement.href}
            >
              <span className="profile-achievement-tag__seal" aria-hidden="true">
                <BadgeCheck size={18} strokeWidth={2.2} />
              </span>
              <span className="profile-achievement-tag__content">
                <strong>{achievement.label}</strong>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </InfoCard>
  )
}
