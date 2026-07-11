export type NoteTag = 'ponto-forte' | 'soft-skill' | 'atencao'

export interface ProfileNote {
  id: string
  professor: string
  context: string
  excerpt: string
  createdAt: string
  tags: NoteTag[]
}

export const MINHAS_NOTAS: ProfileNote[] = [
  {
    id: 'nota-1',
    professor: 'Carlos Fernandes',
    context: 'Entrevista PIBITI 2026.1',
    excerpt:
      'Maria demonstrou ótimo domínio em arquitetura de APIs REST e mostrou repositórios bem documentados. Respostas claras sobre testes e CI.',
    createdAt: '18 jun 2026',
    tags: ['ponto-forte'],
  },
  {
    id: 'nota-2',
    professor: 'Carlos Fernandes',
    context: 'Soft skills',
    excerpt:
      'Comunicação muito boa, lidera bem em equipe. Proativa, fez perguntas estratégicas sobre o projeto.',
    createdAt: '02 jun 2026',
    tags: ['soft-skill', 'ponto-forte'],
  },
  {
    id: 'nota-3',
    professor: 'Ana Silva',
    context: 'Simulação de pitch',
    excerpt:
      'Cuidado com o tempo de apresentação. Faltou detalhar melhor a proposta de valor no final.',
    createdAt: '21 mai 2026',
    tags: ['atencao'],
  },
]

const TAG_LABELS: Record<NoteTag, string> = {
  'ponto-forte': 'Ponto forte',
  'soft-skill': 'Soft skill',
  atencao: 'Atenção',
}

export function tagLabel(tag: NoteTag) {
  return TAG_LABELS[tag]
}
