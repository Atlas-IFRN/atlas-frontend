import { Link, useNavigate } from 'react-router-dom'
import { ProgressBar } from '../../atoms/ProgressBar'
import { useAuth } from '../../../contexts/AuthContext'
import { useEnrollInTrack } from '../../../hooks/useTracks'
import { getTrackRequestErrorMessage } from '../../../services/tracks'
import type { Trail } from '../../../types/tracks'
import { TrailBanner } from './TrailBanner'
import { TrailFooterMeta } from './TrailFooterMeta'
import { TrailSkillList } from './TrailSkillList'

interface TrailCardProps {
  trail: Trail
}

export function TrailCard({ trail }: TrailCardProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const enrollment = useEnrollInTrack()
  const normalizedRole = user?.role.trim().toLowerCase()
  const canEnroll = normalizedRole !== 'teacher' && normalizedRole !== 'professor'

  function handleEnroll() {
    enrollment.mutate(trail.id, {
      onSuccess: () => navigate(`/trilhas/${trail.id}`),
    })
  }

  return (
    <article className="trail-card">
      <Link
        aria-label={`Abrir trilha ${trail.title}`}
        className="trail-card__content-link"
        to={`/trilhas/${trail.id}`}
      >
        <TrailBanner trail={trail} />

        <div className="trail-card__body">
          <h2>{trail.title}</h2>
          <TrailSkillList skills={trail.skills} />
          <p>{trail.description}</p>

          {trail.progress !== null ? (
            <ProgressBar label="Progresso" value={trail.progress} />
          ) : null}
        </div>
      </Link>

      <TrailFooterMeta
        canEnroll={canEnroll}
        isEnrolling={enrollment.isPending}
        onEnroll={handleEnroll}
        trail={trail}
      />

      {enrollment.isError ? (
        <p className="trail-card__enrollment-error" role="alert">
          {getTrackRequestErrorMessage(
            enrollment.error,
            'Não foi possível realizar a inscrição nesta trilha.',
          )}
        </p>
      ) : null}
    </article>
  )
}
