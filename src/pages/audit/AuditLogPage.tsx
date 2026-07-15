import { useEffect, useState } from 'react'
import {
  Activity,
  ChevronDown,
  CirclePlus,
  FileClock,
  PencilLine,
  Search,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { Button } from '../../components/atoms/Button'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import {
  AUDIT_SERVICES,
  getAuditLogsPage,
  type AuditAction,
  type AuditLog,
  type AuditServiceId,
} from '../../services/audit'
import './AuditLogPage.css'

const AUDIT_PAGE_SIZE = 100

const actionMeta: Record<
  AuditAction,
  { label: string; verb: string; icon: typeof CirclePlus }
> = {
  CREATE: { label: 'Criação', verb: 'criou', icon: CirclePlus },
  UPDATE: { label: 'Alteração', verb: 'atualizou', icon: PencilLine },
  DELETE: { label: 'Exclusão', verb: 'removeu', icon: Trash2 },
}

const entityLabels: Record<string, string> = {
  user: 'usuário',
  institution: 'instituição',
  course: 'curso',
  track_category: 'categoria de trilha',
  skill: 'tecnologia',
  track: 'trilha',
  module: 'módulo',
  content: 'conteúdo',
  user_track: 'matrícula em trilha',
  user_module_progress: 'progresso de módulo',
  user_content_progress: 'progresso de conteúdo',
  challenge_submission: 'entrega de desafio',
  technology: 'tecnologia de bolsa',
  scholarship: 'bolsa',
  scholarship_link: 'link de bolsa',
  scholarship_requirement: 'requisito de bolsa',
  scholarship_phase: 'fase de bolsa',
  application: 'candidatura',
  talent: 'registro no banco de talentos',
  note: 'nota de professor',
  post: 'publicação',
  banner: 'comunicado',
  comment: 'comentário',
  post_like: 'curtida em publicação',
  comment_like: 'curtida em comentário',
  notification: 'notificação',
}

const ignoredChangedFields = new Set(['updated_at'])

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getChangedFields(log: AuditLog) {
  const before = log.payload?.before ?? null
  const after = log.payload?.after ?? null
  if (!before || !after) {
    return []
  }

  return Array.from(new Set([...Object.keys(before), ...Object.keys(after)]))
    .filter((field) => !ignoredChangedFields.has(field))
    .filter(
      (field) => JSON.stringify(before[field]) !== JSON.stringify(after[field]),
    )
}

function getEntityLabel(tableName: string) {
  return entityLabels[tableName] ?? tableName.replaceAll('_', ' ')
}

function getActorLabel(log: AuditLog) {
  if (!log.user_id) {
    return 'Sistema'
  }

  return log.actorRegistrationNumber
    ? `Matrícula ${log.actorRegistrationNumber}`
    : 'Matrícula indisponível'
}

function AuditEntry({ log }: { log: AuditLog }) {
  const meta = actionMeta[log.action]
  const Icon = meta.icon
  const service = AUDIT_SERVICES.find(({ id }) => id === log.service)
  const changedFields = getChangedFields(log)

  return (
    <article className="audit-entry" data-action={log.action.toLowerCase()}>
      <span className="audit-entry__icon" aria-hidden="true">
        <Icon size={20} strokeWidth={1.9} />
      </span>

      <div className="audit-entry__body">
        <div className="audit-entry__headline">
          <div>
            <span className="audit-entry__action">{meta.label}</span>
            <h2>
              {getActorLabel(log)} {meta.verb}{' '}
              {getEntityLabel(log.table_name)}
            </h2>
          </div>
          <time dateTime={log.created_at}>{formatDate(log.created_at)}</time>
        </div>

        <div className="audit-entry__meta">
          <span>{service?.label ?? log.service}</span>
          <span aria-hidden="true">•</span>
          <span>{getActorLabel(log)}</span>
          <span aria-hidden="true">•</span>
          <code>{log.record_id}</code>
        </div>

        {changedFields.length > 0 ? (
          <p className="audit-entry__changes">
            Campos alterados: {changedFields.join(', ')}
          </p>
        ) : null}

        <details className="audit-entry__details">
          <summary>
            Ver dados do evento
            <ChevronDown size={16} aria-hidden="true" />
          </summary>
          <pre>{JSON.stringify(log.payload ?? {}, null, 2)}</pre>
        </details>
      </div>
    </article>
  )
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [nextServices, setNextServices] = useState<AuditServiceId[]>([])
  const [failedServices, setFailedServices] = useState<AuditServiceId[]>([])
  const [page, setPage] = useState(1)
  const [visibleCount, setVisibleCount] = useState(AUDIT_PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState('')
  const [serviceFilter, setServiceFilter] = useState<'all' | AuditServiceId>(
    'all',
  )
  const [actionFilter, setActionFilter] = useState<'all' | AuditAction>('all')

  async function loadInitial() {
    setLoading(true)
    setError(false)
    try {
      const result = await getAuditLogsPage()
      setLogs(result.logs)
      setNextServices(result.nextServices)
      setFailedServices(result.failedServices)
      setPage(1)
      setVisibleCount(AUDIT_PAGE_SIZE)
      setError(result.failedServices.length === AUDIT_SERVICES.length)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    getAuditLogsPage()
      .then((result) => {
        if (!active) {
          return
        }
        setLogs(result.logs)
        setNextServices(result.nextServices)
        setFailedServices(result.failedServices)
        setPage(1)
        setVisibleCount(AUDIT_PAGE_SIZE)
        setError(result.failedServices.length === AUDIT_SERVICES.length)
      })
      .catch(() => {
        if (active) {
          setError(true)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  async function loadMore() {
    if (visibleCount < filteredLogs.length) {
      setVisibleCount((current) => current + AUDIT_PAGE_SIZE)
      return
    }

    if (nextServices.length === 0) {
      return
    }
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const result = await getAuditLogsPage(nextPage, nextServices)
      setLogs((current) =>
        [...current, ...result.logs].sort(
          (left, right) =>
            new Date(right.created_at).getTime() -
            new Date(left.created_at).getTime(),
        ),
      )
      setNextServices(result.nextServices)
      setFailedServices((current) => [
        ...new Set([...current, ...result.failedServices]),
      ])
      setPage(nextPage)
      setVisibleCount((current) => current + AUDIT_PAGE_SIZE)
    } finally {
      setLoadingMore(false)
    }
  }

  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')
  const filteredLogs = logs.filter((log) => {
    if (serviceFilter !== 'all' && log.service !== serviceFilter) {
      return false
    }
    if (actionFilter !== 'all' && log.action !== actionFilter) {
      return false
    }
    if (!normalizedQuery) {
      return true
    }
    return [
      getEntityLabel(log.table_name),
      log.table_name,
      log.record_id,
      AUDIT_SERVICES.find(({ id }) => id === log.service)?.label,
      log.actorRegistrationNumber,
    ].some((value) =>
      value?.toLocaleLowerCase('pt-BR').includes(normalizedQuery),
    )
  })

  const visibleLogs = filteredLogs.slice(0, visibleCount)
  const hasMoreLogs =
    visibleCount < filteredLogs.length || nextServices.length > 0

  return (
    <main className="audit-page">
      <header className="audit-page__hero">
        <span className="audit-page__hero-icon" aria-hidden="true">
          <ShieldCheck size={26} />
        </span>
        <div>
          <span className="audit-page__eyebrow">Histórico de atividades</span>
          <h1>Auditoria</h1>
          <p>
            Acompanhe as ações de todos os usuários registradas nos serviços do
            ATLAS.
          </p>
        </div>
      </header>

      <section className="audit-toolbar" aria-label="Filtros da auditoria">
        <label className="audit-search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Buscar no histórico</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setVisibleCount(AUDIT_PAGE_SIZE)
            }}
            placeholder="Buscar por recurso ou identificador..."
          />
        </label>

        <label>
          <span>Serviço</span>
          <select
            value={serviceFilter}
            onChange={(event) => {
              setServiceFilter(event.target.value as 'all' | AuditServiceId)
              setVisibleCount(AUDIT_PAGE_SIZE)
            }}
          >
            <option value="all">Todos</option>
            {AUDIT_SERVICES.map((service) => (
              <option value={service.id} key={service.id}>
                {service.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Ação</span>
          <select
            value={actionFilter}
            onChange={(event) => {
              setActionFilter(event.target.value as 'all' | AuditAction)
              setVisibleCount(AUDIT_PAGE_SIZE)
            }}
          >
            <option value="all">Todas</option>
            <option value="CREATE">Criações</option>
            <option value="UPDATE">Alterações</option>
            <option value="DELETE">Exclusões</option>
          </select>
        </label>
      </section>

      {failedServices.length > 0 && !error ? (
        <div className="audit-page__warning" role="status">
          <TriangleAlert size={18} aria-hidden="true" />
          Parte do histórico está temporariamente indisponível.
        </div>
      ) : null}

      {loading ? (
        <LoadingState message="Carregando histórico..." skeletonCount={5} />
      ) : error ? (
        <ErrorState
          message="Não foi possível consultar os serviços de auditoria agora."
          onRetry={() => void loadInitial()}
        />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={FileClock}
          title="Nenhuma atividade encontrada"
          description={
            logs.length > 0
              ? 'Tente ajustar os filtros da pesquisa.'
              : 'As próximas operações realizadas no sistema aparecerão aqui.'
          }
        />
      ) : (
        <>
          <div className="audit-page__result-heading">
            <div>
              <Activity size={18} aria-hidden="true" />
              <strong>Atividades recentes</strong>
            </div>
            <span>
              {visibleLogs.length} de {filteredLogs.length} registros carregados
            </span>
          </div>

          <section className="audit-timeline" aria-label="Histórico de auditoria">
            {visibleLogs.map((log) => (
              <AuditEntry key={`${log.service}-${log.id}`} log={log} />
            ))}
          </section>

          {hasMoreLogs ? (
            <div className="audit-page__load-more">
              <Button
                variant="outline"
                disabled={loadingMore}
                onClick={() => void loadMore()}
              >
                {loadingMore ? 'Carregando...' : 'Carregar mais atividades'}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </main>
  )
}
