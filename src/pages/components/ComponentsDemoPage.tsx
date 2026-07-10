import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  FileText,
  FileQuestion,
  Home,
  Info,
  LogIn,
  Plus,
  RefreshCcw,
  Settings,
  Sparkles,
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
import { StatCard } from '../../components/atoms/StatCard'
import { StatusBadge } from '../../components/atoms/StatusBadge'
import {
  TechIcon,
  TechTag,
  techIconColors,
  type TechIconName,
  type TechTagCategory,
} from '../../components/atoms/TechTag'
import { TextTag } from '../../components/atoms/TextTag'
import { InfoCard } from '../../components/molecules/InfoCard'
import { UserChip } from '../../components/molecules/UserChip'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import {
  ActiveScholarships,
  Comment,
  CommentComposer,
  FeedFilters,
  FeedHero,
  PostCard,
  PostComposer,
  RailTrackList,
  SegmentedProgress,
  SystemPost,
  type ActiveScholarship,
  type FeedFilter,
  type FeedHeroSlide,
  type FeedPost,
  type FeedTrackProgress,
  type PostComment,
  type SystemPostData,
} from '../../components/feed'
import '../../components/feed/Feed.css'
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

const feedHeroSlides: FeedHeroSlide[] = [
  {
    id: 'demo-welcome',
    eyebrow: 'sexta-feira, 10 de julho de 2026',
    title: 'Olá, Maria.',
    titleAccent: 'Sua jornada continua hoje.',
    description:
      'Você tem 2 trilhas em andamento e 3 bolsas com prazo próximo.',
    actions: [
      { label: 'Continuar trilha', href: '/trilhas', variant: 'primary' },
      { label: 'Ver bolsas', href: '/bolsas', variant: 'soft' },
    ],
  },
  {
    id: 'demo-etal',
    theme: 'green',
    eyebrow: 'Comunicado IFRN · Pau dos Ferros',
    title: 'VII ETAL',
    titleAccent: '2026',
    description:
      'Encontro de Tecnologia, Arte e Linguagens: 26 a 28 de novembro.',
    actions: [
      { label: 'Quero participar', href: '/inicio', variant: 'primary' },
    ],
  },
]

const feedSystemPosts: SystemPostData[] = [
  {
    id: 'demo-sys-1',
    tone: 'primary',
    label: 'Nova bolsa disponível',
    message:
      '<strong>PIBITI 2026.1</strong> — CI/CD com Kubernetes está com inscrições abertas.',
    actionLabel: 'Ver edital',
    actionHref: '/bolsas',
    time: 'há 2h · ATLAS Sistema',
  },
  {
    id: 'demo-sys-2',
    tone: 'ifrn',
    label: 'Comunicado IFRN',
    message:
      'O <strong>VII ETAL</strong> será no Campus Pau dos Ferros em novembro.',
    actionLabel: 'Ver programação',
    actionHref: '/inicio',
    time: 'há 1h · IFRN',
  },
]

const feedScholarships: ActiveScholarship[] = [
  {
    id: 'demo-bolsa-1',
    title: 'PIBITI 2026.1 · CI/CD',
    href: '/bolsas',
    phase: 'inscricao',
    status: 'Inscrições até 07 mai · faltam 2 dias',
  },
  {
    id: 'demo-bolsa-2',
    title: 'IoT com ML',
    href: '/bolsas',
    phase: 'andamento',
    status: 'Em andamento · resultado em 12 mai',
  },
  {
    id: 'demo-bolsa-3',
    title: 'Dados Abertos',
    href: '/bolsas',
    phase: 'resultados',
    status: 'Resultado publicado em 20 mai',
  },
]

const feedTracks: FeedTrackProgress[] = [
  {
    id: 'demo-trilha-backend',
    label: 'Desenvolvimento Backend',
    href: '/trilhas',
    modules: 18,
    completedModules: 11,
    currentModuleProgress: 20,
  },
  {
    id: 'demo-trilha-frontend',
    label: 'Desenvolvimento Frontend',
    href: '/trilhas',
    modules: 22,
    completedModules: 8,
    currentModuleProgress: 40,
  },
]

const feedComment: PostComment = {
  id: 'demo-comment',
  author: {
    id: 'ana',
    name: 'Ana Pereira',
    role: 'Frontend · 2º período',
    avatarColor: 'pink',
  },
  content: 'Boa! O @maria comentou sobre isso também. Salvou demais. #fastapi',
  time: 'há 45min',
  likes: 4,
  replies: [
    {
      id: 'demo-comment-reply',
      author: {
        id: 'rafael',
        name: 'Rafael Souza',
        role: 'Backend · 3º período',
        avatarColor: 'blue',
        badge: 'Autor',
      },
      content: 'Exatamente! Depois te mando o repositório de exemplo.',
      time: 'há 40min',
      likes: 1,
    },
  ],
}

const feedDemoPosts: FeedPost[] = [
  {
    id: 'demo-post-long',
    author: {
      id: 'rafael',
      name: 'Rafael Souza',
      role: 'Backend · 3º período · Trilha Backend',
      avatarColor: 'blue',
    },
    time: 'há 1h',
    content:
      'Finalmente entendi como funciona injeção de dependências no FastAPI. A documentação é excelente, mas o que ajudou mesmo foi ver na prática.\n\nO segredo é pensar em `Depends()` como um contêiner: você declara o que a rota precisa e o framework resolve tudo, com cache por request. Isso deixa os testes bem mais simples. Se tiver dúvida sobre #fastapi ou #python, manda mensagem! @ana obrigado pela dica.',
    variant: 'long-text',
    embed: {
      eyebrow: 'Trilha · Backend',
      title: 'Injeção de Dependências com FastAPI',
      meta: 'Módulo 12 de 18 · 62% concluído',
      tone: 'success',
    },
    likes: 24,
    liked: true,
    shares: 3,
    comments: [feedComment],
  },
  {
    id: 'demo-post-link',
    author: {
      id: 'maria',
      name: 'Maria Santos',
      role: 'TADS · 3º período',
      avatarColor: 'blue',
    },
    time: 'ontem',
    content:
      'Guia excelente sobre padrões de arquitetura para APIs em produção. #backend',
    variant: 'link',
    linkPreview: {
      url: 'https://martinfowler.com/articles/microservices.html',
      domain: 'martinfowler.com',
      title: 'Microservices — a definition of this new architectural term',
      description:
        'Um guia sobre o estilo arquitetural de microsserviços e seus trade-offs.',
      tone: 'blue',
    },
    likes: 33,
    shares: 15,
    comments: [],
  },
]

const feedSegmentedExamples = [
  { label: 'Em progresso', modules: 18, completedModules: 11, current: 20 },
  { label: 'Concluída', modules: 8, completedModules: 8, current: 0 },
  { label: 'Iniciando', modules: 6, completedModules: 0, current: 50 },
]

const noop = () => undefined

export default function ComponentsDemoPage() {
  const navigate = useNavigate()
  const [activeFilters, setActiveFilters] = useState<string[]>([
    'backend',
    'frontend',
  ])
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('for-you')

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
          <a href="#stat-cards">StatCards</a>
          <a href="#info-card">InfoCard</a>
          <a href="#status-badges">Badges</a>
          <a href="#filter-tags">FilterTags</a>
          <a href="#text-tags">TextTags</a>
          <a href="#tech-tags">TechTags</a>
          <a href="#icon-tiles">IconTiles</a>
          <a href="#states">Estados</a>
          <a href="#feed-highlight">Feed</a>
          <a href="#feed-posts">Posts</a>
          <a href="#feed-rails">Rails</a>
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
        aria-labelledby="stat-cards"
      >
        <div className="components-demo-panel-heading">
          <span>03</span>
          <h2 id="stat-cards">StatCard</h2>
        </div>

        <div className="components-demo-stat-grid">
          <StatCard
            actionHref="#stat-cards"
            actionLabel="Ver trilhas"
            icon={BookOpen}
            label="Trilhas ativas"
            value={5}
          />

          <StatCard
            actionHref="#stat-cards"
            actionLabel="Ver minhas"
            icon={FileText}
            label="Minhas candidaturas"
            value={2}
          />

          <StatCard
            actionAriaLabel="Ir para a rota de login"
            actionLabel="Ir para login"
            icon={LogIn}
            label="Exemplo com rota"
            onAction={() => navigate('/login')}
            tone="purple"
            value="URL"
          />
        </div>
      </section>

      <section className="components-demo-panel" aria-labelledby="info-card">
        <div className="components-demo-panel-heading">
          <span>04</span>
          <h2 id="info-card">InfoCard</h2>
        </div>

        <div className="components-demo-info-grid">
          <InfoCard title="O que e o Banco de Talentos?">
            <p>
              Uma vitrine curada de estudantes interessados em bolsas de
              pesquisa, inovacao e extensao.
            </p>
            <p>
              Professores avaliam portfolios, confirmam conhecimentos por
              entrevista e convidam estudantes para projetos.
            </p>
          </InfoCard>

          <InfoCard
            eyebrow="Visao geral"
            icon={<Sparkles />}
            iconTone="primary"
            title="Como funciona"
          >
            <p>
              Trilhas concluidas, tecnologias validadas e desafios entregues
              ajudam a formar um sinal tecnico mais confiavel.
            </p>
          </InfoCard>

          <InfoCard
            action={
              <Link
                className="atlas-button atlas-button--soft atlas-button--sm"
                to="/componentes#info-card"
              >
                Ver todos
              </Link>
            }
            title="Sobre"
          >
            <p>
              Use o slot de acao para links e comandos contextuais sem mudar a
              estrutura visual do bloco.
            </p>
          </InfoCard>
        </div>
      </section>

      <section
        className="components-demo-panel"
        aria-labelledby="status-badges"
      >
        <div className="components-demo-panel-heading">
          <span>05</span>
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
          <span>06</span>
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
          <span>07</span>
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
          <span>08</span>
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
          <span>09</span>
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
          <span>10</span>
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

      <section
        className="components-demo-panel"
        aria-labelledby="feed-highlight"
      >
        <div className="components-demo-panel-heading">
          <span>11</span>
          <h2 id="feed-highlight">Feed · Destaque</h2>
        </div>

        <p className="components-demo-kicker">
          FeedHero — carrossel com autoplay e tema por slide (azul / verde)
        </p>

        <FeedHero slides={feedHeroSlides} />
      </section>

      <section className="components-demo-panel" aria-labelledby="feed-compose">
        <div className="components-demo-panel-heading">
          <span>12</span>
          <h2 id="feed-compose">Feed · Composer e filtros</h2>
        </div>

        <div className="components-demo-feed-stack">
          <PostComposer currentUserName="Maria Santos" />
          <FeedFilters active={feedFilter} onChange={setFeedFilter} />
        </div>
      </section>

      <section className="components-demo-panel" aria-labelledby="feed-system">
        <div className="components-demo-panel-heading">
          <span>13</span>
          <h2 id="feed-system">Feed · Publicações do sistema</h2>
        </div>

        <p className="components-demo-kicker">
          SystemPost — variações primary (bolsa) e ifrn (comunicado)
        </p>

        <div className="components-demo-feed-stack">
          {feedSystemPosts.map((post) => (
            <SystemPost key={post.id} post={post} />
          ))}
        </div>
      </section>

      <section className="components-demo-panel" aria-labelledby="feed-posts">
        <div className="components-demo-panel-heading">
          <span>14</span>
          <h2 id="feed-posts">Feed · Publicações</h2>
        </div>

        <p className="components-demo-kicker">
          PostCard — compõe cabeçalho, corpo, embed/link, ações e comentários
        </p>

        <div className="components-demo-post-list">
          {feedDemoPosts.map((post) => (
            <PostCard
              currentUserName="Maria Santos"
              key={post.id}
              post={post}
            />
          ))}
        </div>
      </section>

      <section
        className="components-demo-panel"
        aria-labelledby="feed-comments"
      >
        <div className="components-demo-panel-heading">
          <span>15</span>
          <h2 id="feed-comments">Feed · Comentários</h2>
        </div>

        <p className="components-demo-kicker">
          Comment (com resposta) e CommentComposer no estilo LinkedIn
        </p>

        <div className="components-demo-post-list">
          <Comment
            comment={feedComment}
            currentUserName="Maria Santos"
            onReply={noop}
            onToggleLike={noop}
          />
          <CommentComposer currentUserName="Maria Santos" onSubmit={noop} />
        </div>
      </section>

      <section className="components-demo-panel" aria-labelledby="feed-rails">
        <div className="components-demo-panel-heading">
          <span>16</span>
          <h2 id="feed-rails">Feed · Colunas laterais</h2>
        </div>

        <p className="components-demo-kicker">
          ActiveScholarships (fases) e RailTrackList (progresso fragmentado)
        </p>

        <div className="components-demo-rails">
          <ActiveScholarships scholarships={feedScholarships} />
          <RailTrackList tracks={feedTracks} />
        </div>

        <p className="components-demo-kicker components-demo-kicker-spaced">
          SegmentedProgress — um segmento por módulo
        </p>

        <div className="components-demo-segmented">
          {feedSegmentedExamples.map((example) => (
            <div key={example.label}>
              <span className="components-demo-segmented__label">
                {example.label}
              </span>
              <SegmentedProgress
                completedModules={example.completedModules}
                currentModuleProgress={example.current}
                modules={example.modules}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
