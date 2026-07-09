import { StatusBadge } from '../../atoms/StatusBadge'
import { TextTag } from '../../atoms/TextTag'
import type { Trail } from '../types'
import { TrailBannerIcon } from '../trailBannerIcons'

interface TrailBannerProps {
  trail: Trail
}

export function TrailBanner({ trail }: TrailBannerProps) {
  return (
    <div className={`trail-banner ${trail.theme}`}>
      <TextTag className="trail-banner__area" size="sm" withDot>
        {trail.area}
      </TextTag>

      <div className="trail-banner__badges">
        {trail.enrolled ? (
          <StatusBadge
            className="trail-banner__badge"
            size="sm"
            status="primary"
          >
            Matriculado
          </StatusBadge>
        ) : null}
        {trail.isNew ? (
          <StatusBadge
            className="trail-banner__badge"
            size="sm"
            status="primary"
          >
            Novo
          </StatusBadge>
        ) : null}
      </div>

      <TrailBannerIcon
        aria-hidden="true"
        className="trail-banner__icon"
        strokeWidth={1.7}
        theme={trail.theme}
      />
    </div>
  )
}
