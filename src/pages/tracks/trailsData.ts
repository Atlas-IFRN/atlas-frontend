import type { Trail, TrailAreaLabel, TrailTheme } from '../../components/trilhas'

export const TRAIL_AREAS = [
  { label: 'Backend', value: 'backend' },
  { label: 'Frontend', value: 'frontend' },
  { label: 'Inteligência Artificial', value: 'ai' },
  { label: 'CI/CD', value: 'cicd' },
  { label: 'DevOps', value: 'devops' },
] as const satisfies ReadonlyArray<{ label: TrailAreaLabel; value: TrailTheme }>

export const TRILHAS: Trail[] = [
  {
    id: 'desenvolvimento-backend',
    title: 'Desenvolvimento Backend',
    area: 'Backend',
    theme: 'backend',
    enrolled: true,
    isNew: false,
    progress: 62,
    modules: 18,
    hours: 120,
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'REST', 'Docker'],
    description:
      'Domine APIs robustas, modelagem de dados, autenticação e arquitetura em produção com Python. Esta trilha conduz o aluno do zero até a entrega de serviços completos, prontos para serem avaliados por IA e usados como prova de competência no Banco de Talentos do NADIC.',
  },
  {
    id: 'desenvolvimento-frontend',
    title: 'Desenvolvimento Frontend',
    area: 'Frontend',
    theme: 'frontend',
    enrolled: true,
    isNew: false,
    progress: 38,
    modules: 22,
    hours: 140,
    skills: ['HTML/CSS', 'JavaScript', 'React', 'TypeScript', 'Vite'],
    description:
      'Do HTML semântico ao React avançado: componentização, estado, testes e acessibilidade. Você sai capaz de entregar interfaces profissionais, com qualidade técnica validada automaticamente pelo ATLAS.',
  },
  {
    id: 'inteligencia-artificial-ml',
    title: 'Inteligência Artificial & ML',
    area: 'Inteligência Artificial',
    theme: 'ai',
    enrolled: false,
    isNew: true,
    progress: 100,
    modules: 24,
    hours: 160,
    skills: ['Python', 'Scikit-learn', 'PyTorch', 'LLMs', 'NLP'],
    description:
      'Fundamentos de ML, redes neurais e LLMs aplicados a problemas reais. A trilha combina teoria matemática e prática com datasets do próprio NADIC, preparando o aluno para projetos de pesquisa.',
  },
  {
    id: 'cicd-entrega-continua',
    title: 'CI/CD & Entrega Contínua',
    area: 'CI/CD',
    theme: 'cicd',
    enrolled: false,
    isNew: true,
    progress: null,
    modules: 14,
    hours: 80,
    skills: ['GitHub Actions', 'Jenkins', 'SonarQube'],
    description:
      'Pipelines de integração, testes automatizados e estratégias de deploy seguro. Aprenda a entregar software com confiança e rastreabilidade em equipes reais.',
  },
  {
    id: 'devops-cloud',
    title: 'DevOps & Cloud',
    area: 'DevOps',
    theme: 'devops',
    enrolled: true,
    isNew: true,
    progress: 20,
    modules: 20,
    hours: 130,
    skills: ['Linux', 'Docker', 'Kubernetes', 'Terraform', 'AWS'],
    description:
      'Infraestrutura como código, observabilidade e cultura DevOps em sistemas críticos. Trilha voltada para alunos que querem atuar com plataformas em nuvem e operar sistemas em produção.',
  },
]
