import { Award, BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCompletedTracks } from '../../hooks/useTracks'
import { Button } from '../atoms/Button'
import { InfoCard } from '../molecules/InfoCard'
import { LoadingState } from '../states/LoadingState'

function completionLabel(value: string | null) {
  if (!value) {
    return 'Trilha concluída'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Trilha concluída'
  }

  return `Concluída em ${date.toLocaleDateString('pt-BR')}`
}

export function ProfileAchievementsCard({ userId }: { userId: string }) {
  const completedTracksQuery = useCompletedTracks(userId)
  const completedTracks = completedTracksQuery.data ?? []

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

      {completedTracksQuery.isLoading ? (
        <LoadingState
          className="profile-achievements__state"
          message="Carregando trilhas concluídas..."
          variant="spinner"
        />
      ) : completedTracksQuery.isError ? (
        <div className="profile-achievements__feedback" role="alert">
          <p>Não foi possível carregar as trilhas concluídas.</p>
          <Button
            onClick={() => void completedTracksQuery.refetch()}
            size="sm"
            variant="soft"
          >
            Tentar novamente
          </Button>
        </div>
      ) : completedTracks.length === 0 ? (
        <p className="profile-achievements__empty">
          Nenhuma trilha concluída até o momento.
        </p>
      ) : (
        <ul className="profile-achievements__list">
          {completedTracks.map((completedTrack) => (
            <li key={completedTrack.trackId}>
              <Link
                className="profile-achievement-tag"
                aria-label={`${completedTrack.title}, trilha concluída`}
                to={`/trilhas/${completedTrack.trackId}`}
              >
                <span
                  className="profile-achievement-tag__seal"
                  aria-hidden="true"
                >
                  <BadgeCheck size={18} strokeWidth={2.2} />
                </span>
                <span className="profile-achievement-tag__content">
                  <strong>{completedTrack.title}</strong>
                  <small>{completionLabel(completedTrack.completedAt)}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </InfoCard>
  )
}
