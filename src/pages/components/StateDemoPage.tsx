import { FileQuestion, RefreshCcw } from 'lucide-react'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import './StateDemoPage.css'

export default function StateDemoPage() {
  return (
    <main className="state-demo-page">
      <header className="state-demo-header">
        <div className="state-demo-title">
          <span className="state-demo-index">04</span>
          <h1>Estados</h1>
        </div>
        <p className="state-demo-nav">loading - empty - error</p>
      </header>

      <section className="state-demo-panel" aria-labelledby="empty-state">
        <h2 id="empty-state">EmptyState</h2>
        <EmptyState
          icon={FileQuestion}
          title="Nenhuma bolsa encontrada"
          description="Tente ajustar os filtros para começar."
        />
      </section>

      <section className="state-demo-panel" aria-labelledby="loading-state">
        <h2 id="loading-state">LoadingState</h2>
        <div className="state-demo-stack">
          <LoadingState message="Carregando cards..." />
          <LoadingState
            variant="spinner"
            message="Salvando alterações..."
          />
        </div>
      </section>

      <section className="state-demo-panel" aria-labelledby="error-state">
        <h2 id="error-state">ErrorState</h2>
        <ErrorState
          icon={RefreshCcw}
          title="Erro ao buscar bolsas"
          message="Não conseguimos carregar as bolsas agora."
          technicalDetail="GET /api/scholarships retornou 503 Service Unavailable"
          onRetry={() => undefined}
        />
      </section>
    </main>
  )
}
