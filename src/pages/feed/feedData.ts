import type {
  ActiveScholarship,
  FeedHeroSlide,
  FeedPost,
  FeedTrackProgress,
  SystemPost as SystemPostData,
} from '../../types/feed'

/**
 * Dados de exemplo do Feed. Nenhuma integração com backend por enquanto:
 * este arquivo existe para ser substituído pelo consumo real depois.
 */

export const HERO_SLIDES: FeedHeroSlide[] = [
  {
    id: 'welcome',
    eyebrow: 'sexta-feira, 10 de julho de 2026',
    title: 'Olá, Maria.',
    titleAccent: 'Sua jornada continua hoje.',
    description:
      'Você tem 2 trilhas em andamento, um desafio prático aguardando avaliação e 3 bolsas com prazo próximo.',
    actions: [
      { label: 'Continuar trilha', href: '/trilhas', variant: 'primary' },
      { label: 'Ver bolsas abertas', href: '/bolsas', variant: 'soft' },
    ],
  },
]

export const MY_TRACKS: FeedTrackProgress[] = [
  {
    id: 'backend',
    label: 'Desenvolvimento Backend',
    href: '/trilhas/desenvolvimento-backend',
    modules: 18,
    completedModules: 11,
    currentModuleProgress: 20,
  },
  {
    id: 'frontend',
    label: 'Desenvolvimento Frontend',
    href: '/trilhas/desenvolvimento-frontend',
    modules: 22,
    completedModules: 8,
    currentModuleProgress: 40,
  },
]

export const ACTIVE_SCHOLARSHIPS: ActiveScholarship[] = [
  {
    id: 'pibiti-cicd',
    title: 'PIBITI 2026.1 · CI/CD',
    href: '/bolsas',
    phase: 'inscricao',
    status: 'Inscrições até 07 mai · faltam 2 dias',
  },
  {
    id: 'iot-ml',
    title: 'IoT com ML',
    href: '/bolsas',
    phase: 'andamento',
    status: 'Em andamento · resultado em 12 mai',
  },
  {
    id: 'dados-abertos',
    title: 'Dados Abertos',
    href: '/bolsas',
    phase: 'resultados',
    status: 'Resultado publicado em 20 mai',
  },
]

export const SYSTEM_POSTS: SystemPostData[] = [
  {
    id: 'pibiti-2026-1',
    tone: 'primary',
    label: 'Nova bolsa disponível',
    message:
      '<strong>PIBITI 2026.1</strong> — Automação de Pipelines CI/CD com Kubernetes e GitOps está com inscrições abertas. Prazo: <strong>07 mai 2026</strong>.',
    actionLabel: 'Ver edital',
    actionHref: '/bolsas',
    time: 'há 2h · ATLAS Sistema',
  },
  {
    id: 'etal-comunicado',
    tone: 'ifrn',
    label: 'Comunicado IFRN',
    message:
      'O <strong>VII ETAL</strong> será realizado no Campus Pau dos Ferros nos dias <strong>26, 27 e 28 de novembro de 2026</strong>. Participe!',
    actionLabel: 'Ver programação',
    actionHref: '/inicio',
    time: 'há 1h · IFRN · Pau dos Ferros',
  },
]

const LONG_TEXT = `Finalmente entendi como funciona injeção de dependências no FastAPI. A documentação é excelente, mas o que ajudou mesmo foi ver na prática.

O segredo é pensar em \`Depends()\` como um contêiner: você declara o que a rota precisa e o framework resolve a árvore de dependências para você, com cache por request. Isso deixa os testes muito mais simples, porque dá para sobrescrever qualquer dependência com \`app.dependency_overrides\`.

Montei um exemplo com sessão de banco, usuário autenticado e paginação, tudo injetado. Reduziu umas 40 linhas de boilerplate por rota. Se alguém tiver dúvida sobre #fastapi ou #python, manda mensagem! @ana obrigado pela dica de ontem.`

const LONG_TEXT_IMAGE = `Passei a madrugada montando o dashboard de métricas do nosso projeto de IoT com ML e o resultado ficou muito melhor do que eu esperava.

A ideia era simples: coletar temperatura e umidade dos sensores, jogar num tópico MQTT, processar com um modelinho de detecção de anomalia e mostrar tudo em tempo real. O que mais deu trabalho foi calibrar o threshold para não disparar alerta à toa — acabei usando uma média móvel de 5 minutos.

Print do painel abaixo. Ainda falta polir o mobile, mas a base está de pé! Quem estiver na trilha de #iot ou curtindo #dados, bora trocar ideia. #machinelearning`

export const FEED_POSTS: FeedPost[] = [
  {
    id: 'post-long-text',
    author: {
      id: 'rafael',
      name: 'Rafael Souza',
      role: 'Backend · 3º período · Trilha Backend — Módulo 12',
      avatarColor: 'blue',
    },
    time: 'há 1h',
    content: LONG_TEXT,
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
    comments: [
      {
        id: 'c1',
        author: {
          id: 'ana',
          name: 'Ana Pereira',
          role: 'Frontend · 2º período',
          avatarColor: 'pink',
        },
        content:
          'Boa, Rafael! O @maria também tinha comentado sobre os overrides nos testes. Salvou demais.',
        time: 'há 45min',
        likes: 4,
        replies: [
          {
            id: 'c1-r1',
            author: {
              id: 'rafael',
              name: 'Rafael Souza',
              role: 'Backend · 3º período',
              avatarColor: 'blue',
            },
            content: 'Exatamente! Depois te mando o repositório de exemplo.',
            time: 'há 40min',
            likes: 1,
          },
        ],
      },
      {
        id: 'c2',
        author: {
          id: 'carlos',
          name: 'Prof. Carlos Fernandes',
          role: 'Orientador · PIBITI / DevOps',
          avatarColor: 'teal',
          badge: 'Professor',
        },
        content:
          'Ótimo resumo. Vale complementar lendo sobre escopo de dependências (request vs. app). #fastapi',
        time: 'há 30min',
        likes: 9,
      },
    ],
  },
  {
    id: 'post-professor',
    author: {
      id: 'carlos',
      name: 'Prof. Carlos Fernandes',
      role: 'Orientador · PIBITI / DevOps',
      avatarColor: 'teal',
      badge: 'Professor',
    },
    time: 'há 3h',
    content:
      'Atenção aos candidatos à bolsa PIBITI 2026.1 de IoT com ML: reunião de orientação pré-candidatura na sexta-feira, 02 mai, às 14h, sala 12 do bloco B. Tragam dúvidas sobre o plano de trabalho. #pibiti #pesquisa',
    variant: 'text',
    likes: 41,
    shares: 12,
    comments: [
      {
        id: 'c3',
        author: {
          id: 'joao',
          name: 'João Lima',
          role: 'Sistemas · 4º período',
          avatarColor: 'amber',
        },
        content: 'Vou levar o rascunho do plano. Posso apresentar na reunião?',
        time: 'há 2h',
        likes: 2,
      },
    ],
  },
  {
    id: 'post-image',
    author: {
      id: 'ana',
      name: 'Ana Pereira',
      role: 'Frontend · 2º período',
      avatarColor: 'pink',
    },
    time: 'há 5h',
    content:
      'Terminei o módulo de `React Hooks avançados`! Custou, mas consegui montar meu primeiro design system component. Deixei um preview do resultado. Manda mensagem se travar nessa parte! #react #frontend',
    variant: 'image',
    media: {
      alt: 'Preview de um componente de design system em tema escuro',
      tone: 'purple',
      caption: 'Design System · Button playground',
    },
    likes: 18,
    shares: 2,
    comments: [
      {
        id: 'c4',
        author: {
          id: 'maria',
          name: 'Maria Santos',
          role: 'TADS · 3º período',
          avatarColor: 'blue',
        },
        content: 'Ficou lindo! Qual lib de ícones você usou?',
        time: 'há 4h',
        likes: 3,
        replies: [
          {
            id: 'c4-r1',
            author: {
              id: 'ana',
              name: 'Ana Pereira',
              role: 'Frontend · 2º período',
              avatarColor: 'pink',
            },
            content: 'lucide-react! Leve e combina com o tema do ATLAS.',
            time: 'há 3h',
            likes: 2,
          },
        ],
      },
    ],
  },
  {
    id: 'post-image-long',
    author: {
      id: 'joao',
      name: 'João Lima',
      role: 'Sistemas · 4º período · Trilha IoT',
      avatarColor: 'amber',
    },
    time: 'há 8h',
    content: LONG_TEXT_IMAGE,
    variant: 'image-long',
    media: {
      alt: 'Dashboard de métricas de sensores IoT em tempo real',
      tone: 'teal',
      caption: 'Painel · Sensores IoT em tempo real',
    },
    likes: 57,
    shares: 9,
    comments: [
      {
        id: 'c5',
        author: {
          id: 'carlos',
          name: 'Prof. Carlos Fernandes',
          role: 'Orientador · PIBITI / DevOps',
          avatarColor: 'teal',
          badge: 'Professor',
        },
        content:
          'Excelente, João! Traga esse painel para a reunião de orientação. É exatamente o tipo de evidência que fortalece a candidatura.',
        time: 'há 6h',
        likes: 11,
      },
      {
        id: 'c6',
        author: {
          id: 'ana',
          name: 'Ana Pereira',
          role: 'Frontend · 2º período',
          avatarColor: 'pink',
        },
        content: 'Que trabalho lindo! Qual biblioteca você usou pra os gráficos?',
        time: 'há 5h',
        likes: 5,
      },
      {
        id: 'c7',
        author: {
          id: 'rafael',
          name: 'Rafael Souza',
          role: 'Backend · 3º período',
          avatarColor: 'blue',
        },
        content:
          'A média móvel foi uma sacada boa pra reduzir o ruído. Manda o repo depois! #iot',
        time: 'há 4h',
        likes: 3,
      },
      {
        id: 'c8',
        author: {
          id: 'maria',
          name: 'Maria Santos',
          role: 'TADS · 3º período',
          avatarColor: 'blue',
        },
        content: 'Salvei aqui pra usar de referência no meu projeto. Muito bom!',
        time: 'há 3h',
        likes: 2,
      },
      {
        id: 'c9',
        author: {
          id: 'joao',
          name: 'João Lima',
          role: 'Sistemas · 4º período',
          avatarColor: 'amber',
        },
        content:
          'Valeu, pessoal! Uso Recharts pros gráficos. Vou organizar o repo e compartilho o link por aqui. 🙌',
        time: 'há 2h',
        likes: 8,
      },
    ],
  },
  {
    id: 'post-link',
    author: {
      id: 'maria',
      name: 'Maria Santos',
      role: 'TADS · 3º período',
      avatarColor: 'blue',
    },
    time: 'ontem',
    content:
      'Guia excelente sobre padrões de arquitetura para APIs em produção. Vale muito a leitura para quem está na trilha de #backend. Salvei nos favoritos!',
    variant: 'link',
    linkPreview: {
      url: 'https://martinfowler.com/articles/microservices.html',
      domain: 'martinfowler.com',
      title: 'Microservices — a definition of this new architectural term',
      description:
        'Um guia detalhado sobre o estilo arquitetural de microsserviços, seus benefícios e trade-offs em sistemas reais.',
      tone: 'blue',
    },
    likes: 33,
    shares: 15,
    comments: [],
  },
]
