export type TrailDetailTab = 'overview' | 'modules'

interface TrailDetailTabsProps {
  activeTab: TrailDetailTab
  onTabChange: (tab: TrailDetailTab) => void
}

export function TrailDetailTabs({
  activeTab,
  onTabChange,
}: TrailDetailTabsProps) {
  return (
    <div className="trail-detail-tabs" role="tablist" aria-label="Detalhes">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'overview'}
        className={activeTab === 'overview' ? 'active' : undefined}
        onClick={() => onTabChange('overview')}
      >
        Visão geral
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'modules'}
        className={activeTab === 'modules' ? 'active' : undefined}
        onClick={() => onTabChange('modules')}
      >
        Módulos
      </button>
    </div>
  )
}
