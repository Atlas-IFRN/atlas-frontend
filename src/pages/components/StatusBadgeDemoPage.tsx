import { StatusBadge } from '../../components/atoms/StatusBadge'
import './StatusBadgeDemoPage.css'

const visualStatuses = [
  'primary',
  'completed',
  'in-progress',
  'success',
  'warning',
  'danger',
  'pink',
  'neutral',
] as const

const taskStatuses = [
  'active',
  'inactive',
  'pending',
  'approved',
  'rejected',
] as const

export default function StatusBadgeDemoPage() {
  return (
    <main className="status-badge-demo-page">
      <header className="status-badge-demo-header">
        <div className="status-badge-demo-title">
          <span className="status-badge-demo-index">04</span>
          <h1>Badges de Status</h1>
        </div>
        <p className="status-badge-demo-nav">
          active · pending · approved · rejected
        </p>
      </header>

      <section
        className="status-badge-demo-panel"
        aria-labelledby="status-badge-visual"
      >
        <h2 id="status-badge-visual">Badges da referência</h2>
        <div className="status-badge-demo-row">
          {visualStatuses.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </section>

      <section
        className="status-badge-demo-panel"
        aria-labelledby="status-badge-system"
      >
        <h2 id="status-badge-system">Estados da task</h2>
        <div className="status-badge-demo-row">
          {taskStatuses.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </section>

      <section
        className="status-badge-demo-panel"
        aria-labelledby="status-badge-sizes"
      >
        <h2 id="status-badge-sizes">Tamanhos</h2>
        <div className="status-badge-demo-row">
          <StatusBadge status="approved" size="sm">
            Aprovado sm
          </StatusBadge>
          <StatusBadge status="approved" size="md">
            Aprovado md
          </StatusBadge>
          <StatusBadge status="pending" size="sm">
            Pendente sm
          </StatusBadge>
          <StatusBadge status="pending" size="md">
            Pendente md
          </StatusBadge>
        </div>
      </section>
    </main>
  )
}
