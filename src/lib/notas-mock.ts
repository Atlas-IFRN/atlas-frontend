import carlosAvatar from '../assets/avatars/carlos-fernandes.svg'
import juliaAvatar from '../assets/avatars/julia-tavares.svg'
import ricardoAvatar from '../assets/avatars/ricardo-mota.svg'

export type NoteTag = 'hard-skill' | 'soft-skill'

export interface ProfileNote {
  id: string
  professor: {
    name: string
    avatarSrc: string
  }
  content: string
  createdAt: string
  dateTime: string
  tag: NoteTag
}

export const MINHAS_NOTAS: ProfileNote[] = [
  {
    id: 'nota-1',
    professor: {
      name: 'Carlos Fernandes',
      avatarSrc: carlosAvatar,
    },
    content:
      'Demonstrou ótimo domínio em arquitetura de APIs REST e apresentou repositórios bem documentados. As respostas sobre testes e integração contínua foram claras e objetivas.',
    createdAt: '18 jun 2026, 14:30',
    dateTime: '2026-06-18T14:30:00-03:00',
    tag: 'hard-skill',
  },
  {
    id: 'nota-2',
    professor: {
      name: 'Ricardo Mota',
      avatarSrc: ricardoAvatar,
    },
    content:
      'Excelente uso de hooks personalizados e atenção à performance no React. Também demonstrou cuidado com acessibilidade durante toda a implementação.',
    createdAt: '10 jun 2026, 16:20',
    dateTime: '2026-06-10T16:20:00-03:00',
    tag: 'hard-skill',
  },
  {
    id: 'nota-3',
    professor: {
      name: 'Carlos Fernandes',
      avatarSrc: carlosAvatar,
    },
    content:
      'Comunica-se muito bem, contribui para a organização da equipe e faz perguntas estratégicas sobre o projeto. Demonstrou iniciativa e escuta ativa.',
    createdAt: '02 jun 2026, 14:42',
    dateTime: '2026-06-02T14:42:00-03:00',
    tag: 'soft-skill',
  },
  {
    id: 'nota-4',
    professor: {
      name: 'Júlia Tavares',
      avatarSrc: juliaAvatar,
    },
    content:
      'Estudante curiosa, colaborativa e aberta a feedbacks. Faz perguntas que vão além do escopo da aula e compartilha aprendizados com os colegas.',
    createdAt: '21 mai 2026, 18:40',
    dateTime: '2026-05-21T18:40:00-03:00',
    tag: 'soft-skill',
  },
]

const TAG_LABELS: Record<NoteTag, string> = {
  'hard-skill': 'Hard Skill',
  'soft-skill': 'Soft Skill',
}

export function tagLabel(tag: NoteTag) {
  return TAG_LABELS[tag]
}
