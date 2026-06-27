import { useState } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  FileQuestion,
  Home,
  Info,
  Plus,
  RefreshCcw,
  Settings,
  Trash2,
  TriangleAlert,
  X,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../components/atoms/Button'
import { FilterTag } from '../../components/atoms/FilterTag'
import { IconTile } from '../../components/atoms/IconTile'
import { StatusBadge } from '../../components/atoms/StatusBadge'
import { TextTag } from '../../components/atoms/TextTag'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import './ComponentsDemoPage.css'

const badgeStatuses = [
  'primary',
  'completed',
  'in-progress',
  'success',
  'warning',
  'danger',
  'pink',
  'neutral',
] as const

const iconTileVariants = [
  { label: 'Primary', value: 'primary', icon: Info },
  { label: 'Success', value: 'success', icon: CheckCircle2 },
  { label: 'Warning', value: 'warning', icon: TriangleAlert },
  { label: 'Danger', value: 'danger', icon: XCircle },
  { label: 'Neutral', value: 'neutral', icon: Circle },
] as const

const iconTileSizes = ['sm', 'md', 'lg'] as const
const textTags = [
  'Algoritmos',
  'Estatistica',
  'Cloud',
  'DevOps',
  'Banco de dados',
  'Metricas',
] as const
const textTagVariants = ['default', 'outline', 'subtle'] as const

type FilterTagDemoItem = {
  icon?: LucideIcon
  label: string
  value: string
}

const filterTags: FilterTagDemoItem[] = [
  { label: 'Backend', value: 'backend', icon: Circle },
  { label: 'Frontend', value: 'frontend', icon: Circle },
  { label: 'IA', value: 'ia', icon: Circle },
  { label: 'IoT', value: 'iot', icon: Circle },
  { label: 'Dados', value: 'dados', icon: Circle },
]

export default function ComponentsDemoPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>([
    'backend',
    'frontend',
  ])

  return (
    <main className="components-demo-page">
      <header className="components-demo-header">
        <div className="components-demo-title">
          <span className="components-demo-index">UI</span>
          <h1>Componentes</h1>
        </div>

        <nav className="components-demo-nav" aria-label="Componentes">
          <a href="#buttons">Botoes</a>
          <a href="#status-badges">Badges</a>
          <a href="#filter-tags">FilterTags</a>
          <a href="#text-tags">TextTags</a>
          <a href="#icon-tiles">IconTiles</a>
          <a href="#states">Estados</a>
        </nav>
      </header>

      <section className="components-demo-panel" aria-labelledby="buttons">
        <div className="components-demo-panel-heading">
          <span>01</span>
          <h2 id="buttons">Botoes</h2>
        </div>

        <div className="components-demo-row">
          <Button variant="primary">Primario</Button>
          <Button variant="outline">Secundario</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="dark">Dark</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
        </div>

        <div className="components-demo-row">
          <Button size="sm">Pequeno</Button>
          <Button size="md">Padrao</Button>
          <Button size="lg">Grande</Button>
          <Button variant="outline" size="pill">
            Pill
          </Button>
          <Button iconLeft={Check}>Confirmar</Button>
          <Button variant="outline" iconLeft={Plus}>
            Adicionar
          </Button>
          <Button variant="outline" iconLeft={Settings} aria-label="Configurar" />
          <Button variant="ghost" iconLeft={X} aria-label="Fechar" />
          <Button variant="danger" iconLeft={Trash2} iconRight={ArrowRight}>
            Excluir
          </Button>
        </div>
      </section>

      <section
        className="components-demo-panel"
        aria-labelledby="status-badges"
      >
        <div className="components-demo-panel-heading">
          <span>02</span>
          <h2 id="status-badges">StatusBadge</h2>
        </div>

        <div className="components-demo-row">
          {badgeStatuses.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>

      </section>

      <section className="components-demo-panel" aria-labelledby="filter-tags">
        <div className="components-demo-panel-heading">
          <span>03</span>
          <h2 id="filter-tags">FilterTag</h2>
        </div>

        <div className="components-demo-row">
          {filterTags.map(({ label, value, icon }) => {
            const isActive = activeFilters.includes(value)

            return (
              <FilterTag
                active={isActive}
                iconLeft={isActive ? icon : undefined}
                key={value}
                label={label}
                onClick={() =>
                  setActiveFilters((current) =>
                    current.includes(value)
                      ? current.filter((filter) => filter !== value)
                      : [...current, value],
                  )
                }
              />
            )
          })}

          <FilterTag
            disabled
            iconLeft={Circle}
            label="Desabilitado"
            onClick={() => setActiveFilters(['disabled'])}
          />
      <section className="components-demo-panel" aria-labelledby="text-tags">
        <div className="components-demo-panel-heading">
          <span>03</span>
          <h2 id="text-tags">TextTag</h2>
        </div>

        <p className="components-demo-kicker">Tags simples (texto)</p>

        <div className="components-demo-row">
          {textTags.map((tag) => (
            <TextTag key={tag}>{tag}</TextTag>
          ))}
        </div>

        <div className="components-demo-row">
          {textTagVariants.map((variant) => (
            <TextTag key={variant} variant={variant}>
              {variant}
            </TextTag>
          ))}
        </div>

        <div className="components-demo-row">
          <TextTag size="sm">Pequena</TextTag>
          <TextTag size="md">Padrao</TextTag>
        </div>
      </section>

      <section className="components-demo-panel" aria-labelledby="icon-tiles">
        <div className="components-demo-panel-heading">
          <span>04</span>
          <h2 id="icon-tiles">IconTile</h2>
        </div>

        <div className="components-demo-grid">
          {iconTileVariants.map(({ label, value, icon }) => (
            <div className="components-demo-item" key={value}>
              <IconTile icon={icon} variant={value} aria-label={label} />
            </div>
          ))}
        </div>

        <div className="components-demo-row">
          {iconTileSizes.map((size) => (
            <IconTile
              aria-label={`IconTile ${size}`}
              icon={Home}
              key={size}
              size={size}
            />
          ))}
          <IconTile aria-label="Inicio pelo registry" name="Home" />
          <IconTile
            aria-label="Inicio sucesso pelo registry"
            name="Home"
            variant="success"
          />
        </div>
      </section>

      <section className="components-demo-panel" aria-labelledby="states">
        <div className="components-demo-panel-heading">
          <span>05</span>
          <h2 id="states">Estados</h2>
        </div>

        <div className="components-demo-state-grid">
          <EmptyState
            icon={FileQuestion}
            title="Nenhuma bolsa encontrada"
            description="Tente ajustar os filtros para comecar."
          />

          <div className="components-demo-state-stack">
            <LoadingState message="Carregando cards..." />
            <LoadingState
              variant="spinner"
              message="Salvando alteracoes..."
            />
          </div>

          <ErrorState
            icon={RefreshCcw}
            title="Erro ao buscar bolsas"
            message="Nao conseguimos carregar as bolsas agora."
            technicalDetail="GET /api/scholarships retornou 503 Service Unavailable"
            onRetry={() => undefined}
          />
        </div>
      </section>
    </main>
  )
}
