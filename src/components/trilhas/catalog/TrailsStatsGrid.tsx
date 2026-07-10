import { Award, BookOpen, Briefcase } from 'lucide-react'
import { StatCard } from '../../atoms/StatCard'
import type { TrailsStats } from '../../../types/tracks'

interface TrailsStatsGridProps {
  stats: TrailsStats
}

export function TrailsStatsGrid({ stats }: TrailsStatsGridProps) {
  return (
    <section className="trails-stats-grid" aria-label="Resumo das trilhas">
      <StatCard
        actionHref="#trails-list"
        actionLabel="Ver trilhas"
        icon={BookOpen}
        label="Trilhas ativas"
        value={stats.activeTrails}
      />
      <StatCard
        actionLabel="Emitir certificado"
        icon={Award}
        label="Certificados"
        tone="teal"
        value={stats.certificates}
      />
      <StatCard
        actionHref="/bolsas"
        actionLabel="Ver editais"
        icon={Briefcase}
        label="Bolsas abertas"
        tone="purple"
        value={stats.scholarships}
      />
    </section>
  )
}
