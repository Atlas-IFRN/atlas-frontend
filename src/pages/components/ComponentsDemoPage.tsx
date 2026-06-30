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
import {
  Avatar,
  type AvatarColor,
  type AvatarSize,
} from '../../components/atoms/Avatar'
import { Button } from '../../components/atoms/Button'
import { FilterTag } from '../../components/atoms/FilterTag'
import { IconTile } from '../../components/atoms/IconTile'
import { StatusBadge } from '../../components/atoms/StatusBadge'
import {
  TechIcon,
  TechTag,
  techIconColors,
  type TechIconName,
  type TechTagCategory,
} from '../../components/atoms/TechTag'
import { TextTag } from '../../components/atoms/TextTag'
import { UserChip } from '../../components/molecules/UserChip'
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
const avatarColors: Array<{ color: AvatarColor; name: string }> = [
  { color: 'blue', name: 'Maria Santos' },
  { color: 'teal', name: 'Joao Lima' },
  { color: 'purple', name: 'Paula Alves' },
  { color: 'amber', name: 'Ana Clara' },
  { color: 'pink', name: 'Rafaela Silva' },
]
const avatarSizes: Array<{ label: string; size: AvatarSize }> = [
  { label: 'sm', size: 'sm' },
  { label: 'md', size: 'md' },
  { label: 'lg', size: 'lg' },
]
const textTags = [
  'Algoritmos',
  'Estatistica',
  'Cloud',
  'DevOps',
  'Banco de dados',
  'Metricas',
] as const
const textTagVariants = ['default', 'outline', 'subtle'] as const

type TechTagDemoItem = {
  accentColor?: string
  category: TechTagCategory
  icon?: TechIconName
  label: string
}

const techTags: TechTagDemoItem[] = [
  {
    accentColor: techIconColors.python,
    category: 'language',
    icon: 'python',
    label: 'Python',
  },
  {
    accentColor: techIconColors.react,
    category: 'framework',
    icon: 'react',
    label: 'React',
  },
  {
    accentColor: techIconColors.typescript,
    category: 'language',
    icon: 'typescript',
    label: 'TypeScript',
  },
  {
    accentColor: techIconColors.tensorflow,
    category: 'framework',
    icon: 'tensorflow',
    label: 'TensorFlow',
  },
  {
    accentColor: techIconColors.postgresql,
    category: 'infra',
    icon: 'postgresql',
    label: 'PostgreSQL',
  },
  {
    accentColor: techIconColors.docker,
    category: 'infra',
    icon: 'docker',
    label: 'Docker',
  },
  {
    accentColor: techIconColors.nodejs,
    category: 'framework',
    icon: 'nodejs',
    label: 'Node.js',
  },
  {
    accentColor: techIconColors['raspberry-pi'],
    category: 'tool',
    icon: 'raspberry-pi',
    label: 'Raspberry Pi',
  },
  {
    accentColor: techIconColors.java,
    category: 'language',
    icon: 'java',
    label: 'Java',
  },
  {
    accentColor: techIconColors['c-plus-plus'],
    category: 'language',
    icon: 'c-plus-plus',
    label: 'C++',
  },
  {
    accentColor: techIconColors.go,
    category: 'language',
    icon: 'go',
    label: 'Go',
  },
  {
    accentColor: techIconColors.rust,
    category: 'language',
    icon: 'rust',
    label: 'Rust',
  },
  {
    accentColor: techIconColors.nextjs,
    category: 'framework',
    icon: 'nextjs',
    label: 'Next.js',
  },
  {
    accentColor: techIconColors.vue,
    category: 'framework',
    icon: 'vue',
    label: 'Vue',
  },
  {
    accentColor: techIconColors.angular,
    category: 'framework',
    icon: 'angular',
    label: 'Angular',
  },
  {
    accentColor: techIconColors.spring,
    category: 'framework',
    icon: 'spring',
    label: 'Spring',
  },
  {
    accentColor: techIconColors.kubernetes,
    category: 'infra',
    icon: 'kubernetes',
    label: 'Kubernetes',
  },
  {
    accentColor: techIconColors.mongodb,
    category: 'infra',
    icon: 'mongodb',
    label: 'MongoDB',
  },
  {
    accentColor: techIconColors.redis,
    category: 'infra',
    icon: 'redis',
    label: 'Redis',
  },
  {
    accentColor: techIconColors.git,
    category: 'tool',
    icon: 'git',
    label: 'Git',
  },
  {
    accentColor: techIconColors.figma,
    category: 'tool',
    icon: 'figma',
    label: 'Figma',
  },
  {
    accentColor: techIconColors.postman,
    category: 'tool',
    icon: 'postman',
    label: 'Postman',
  },
  {
    accentColor: techIconColors.vite,
    category: 'tool',
    icon: 'vite',
    label: 'Vite',
  },
]

const tintedTechTags = techTags.filter(({ label }) =>
  ['Python', 'React', 'TypeScript', 'Docker', 'Node.js', 'Java'].includes(label),
)

const solidTechTags: TechTagDemoItem[] = [
  techTags[0],
  techTags[1],
  techTags[4],
  techTags[10],
  {
    category: 'infra',
    label: 'Sem icone',
  },
]

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

function renderTechIcon(icon?: TechIconName) {
  return icon ? <TechIcon name={icon} /> : undefined
}

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
          <a href="#identity">Identidade</a>
          <a href="#buttons">Botoes</a>
          <a href="#status-badges">Badges</a>
          <a href="#filter-tags">FilterTags</a>
          <a href="#text-tags">TextTags</a>
          <a href="#tech-tags">TechTags</a>
          <a href="#icon-tiles">IconTiles</a>
          <a href="#states">Estados</a>
        </nav>
      </header>

      <section className="components-demo-panel" aria-labelledby="identity">
        <div className="components-demo-panel-heading">
          <span>01</span>
          <h2 id="identity">Identidade</h2>
        </div>

        <p className="components-demo-kicker">Avatares - paleta padronizada</p>

        <div className="components-demo-avatar-row">
          {avatarColors.map(({ color, name }) => (
            <div className="components-demo-avatar-swatch" key={color}>
              <Avatar color={color} name={name} />
              <span>{color}</span>
            </div>
          ))}
        </div>

        <p className="components-demo-kicker components-demo-kicker-spaced">
          Tamanhos
        </p>

        <div className="components-demo-avatar-row">
          {avatarSizes.map(({ label, size }) => (
            <div className="components-demo-avatar-swatch" key={size}>
              <Avatar name="Maria Santos" size={size} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <p className="components-demo-kicker components-demo-kicker-spaced">
          UserChip
        </p>

        <div className="components-demo-userchip-list">
          <UserChip
            color="blue"
            name="Maria Santos"
            role="Estudante · TADS"
          />
          <UserChip
            color="teal"
            name="Prof. Joao Lima"
            role="Professor · Banco de Dados"
          />
          <UserChip
            color="purple"
            name="Ana Beatriz"
            role="Estudante"
            size="sm"
          />
        </div>
      </section>

      <section className="components-demo-panel" aria-labelledby="buttons">
        <div className="components-demo-panel-heading">
          <span>02</span>
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
          <span>03</span>
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
          <span>04</span>
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
        </div>
      </section>

      <section className="components-demo-panel" aria-labelledby="text-tags">
        <div className="components-demo-panel-heading">
          <span>05</span>
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

      <section className="components-demo-panel" aria-labelledby="tech-tags">
        <div className="components-demo-panel-heading">
          <span>06</span>
          <h2 id="tech-tags">TechTag</h2>
        </div>

        <p className="components-demo-kicker">
          Tags de tecnologia - com icone (simple icons)
        </p>

        <div className="components-demo-row">
          {techTags.map(({ accentColor, category, icon, label }) => (
            <TechTag
              accentColor={accentColor}
              category={category}
              icon={renderTechIcon(icon)}
              key={label}
            >
              {label}
            </TechTag>
          ))}
        </div>

        <p className="components-demo-kicker components-demo-kicker-spaced">
          Variacao tinted (cor da marca)
        </p>

        <div className="components-demo-row">
          {tintedTechTags.map(({ accentColor, category, icon, label }) => (
            <TechTag
              accentColor={accentColor}
              category={category}
              icon={renderTechIcon(icon)}
              key={label}
              variant="tinted"
            >
              {label}
            </TechTag>
          ))}
        </div>

        <p className="components-demo-kicker components-demo-kicker-spaced">
          Variacao solid
        </p>

        <div className="components-demo-row">
          {solidTechTags.map(({ accentColor, category, icon, label }) => (
            <TechTag
              accentColor={accentColor}
              category={category}
              icon={renderTechIcon(icon)}
              key={label}
              variant={icon ? 'solid' : 'outline'}
            >
              {label}
            </TechTag>
          ))}
        </div>
      </section>

      <section className="components-demo-panel" aria-labelledby="icon-tiles">
        <div className="components-demo-panel-heading">
          <span>07</span>
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
          <span>08</span>
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
