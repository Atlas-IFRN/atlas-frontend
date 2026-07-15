import {
  techIconColors,
  techIcons,
  type TechIconName,
} from './TechIcon.colors'
import type { TechTagCategory } from './TechTag'

interface TechnologyLike {
  name: string
  slug?: string
  category?: string
}

export interface TechnologyMeta {
  accentColor?: string
  category: TechTagCategory
  iconName: TechIconName | null
}

const CATEGORY_BY_API_VALUE: Record<string, TechTagCategory> = {
  LANGUAGE: 'language',
  FRAMEWORK: 'framework',
  DATABASE: 'database',
  DATA_AI: 'data-ai',
  INFRA: 'infra',
  TOOL: 'tool',
}

const ICON_ALIASES: Record<string, TechIconName> = {
  'c++': 'c-plus-plus',
  'django-rest-framework': 'django',
  drf: 'django',
  javascript: 'nodejs',
  'next-js': 'nextjs',
  'node-js': 'nodejs',
  postgres: 'postgresql',
  'react-native': 'react',
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9+]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getTechnologyMeta(technology: TechnologyLike): TechnologyMeta {
  const normalizedSlug = normalizeSlug(technology.slug || technology.name)
  const iconCandidate = ICON_ALIASES[normalizedSlug] ?? normalizedSlug
  const iconName =
    iconCandidate in techIcons ? (iconCandidate as TechIconName) : null

  return {
    accentColor: iconName ? techIconColors[iconName] : undefined,
    category: CATEGORY_BY_API_VALUE[technology.category ?? ''] ?? 'tool',
    iconName,
  }
}
