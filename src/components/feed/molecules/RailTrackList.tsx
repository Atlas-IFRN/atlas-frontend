import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ButtonLink } from '../../atoms/ButtonLink'
import type { FeedTrackProgress } from '../types'
import { SegmentedProgress } from './SegmentedProgress'

interface RailTrackListProps {
  tracks: FeedTrackProgress[]
  exploreHref?: string
}

function overallPercent(track: FeedTrackProgress) {
  if (track.modules === 0) {
    return 0
  }

  const ratio =
    (track.completedModules + track.currentModuleProgress / 100) /
    track.modules

  return Math.round(ratio * 100)
}

/** Bloco "Minhas trilhas": cada trilha é um link com progresso fragmentado. */
export function RailTrackList({
  tracks,
  exploreHref = '/trilhas',
}: RailTrackListProps) {
  return (
    <section className="rail-block">
      <h2 className="rail-block__label">Minhas trilhas</h2>

      <div className="rail-track-list">
        {tracks.map((track) => (
          <Link className="rail-track" key={track.id} to={track.href}>
            <span className="rail-track__name">{track.label}</span>

            <SegmentedProgress
              completedModules={track.completedModules}
              currentModuleProgress={track.currentModuleProgress}
              modules={track.modules}
            />

            <span className="rail-track__meta">
              {track.completedModules} de {track.modules} módulos ·{' '}
              {overallPercent(track)}%
            </span>
          </Link>
        ))}
      </div>

      <ButtonLink
        className="rail-block__cta"
        size="sm"
        to={exploreHref}
        variant="soft"
      >
        <BookOpen aria-hidden="true" size={16} strokeWidth={2} />
        <span>Explorar trilhas</span>
      </ButtonLink>
    </section>
  )
}
