export type TrailDetailTab = 'overview' | 'modules'

interface TrailDetailTabsProps {
  activeTab: TrailDetailTab
  onTabChange: (tab: TrailDetailTab) => void
}

const tabs = [
  { value: 'overview', label: 'Visão geral' },
  { value: 'modules', label: 'Módulos' },
] satisfies Array<{ value: TrailDetailTab; label: string }>

export function TrailDetailTabs({
  activeTab,
  onTabChange,
}: TrailDetailTabsProps) {
  return (
    <div className="trail-detail-tabs" role="tablist" aria-label="Detalhes da trilha">
      {tabs.map((tab) => (
        <button
          aria-selected={activeTab === tab.value}
          className="trail-detail-tabs__button"
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          role="tab"
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
