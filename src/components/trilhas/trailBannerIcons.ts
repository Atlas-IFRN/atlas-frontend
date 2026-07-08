import { createElement, type ComponentProps } from 'react'
import {
  Braces,
  BrainCircuit,
  CloudCog,
  Code2,
  GitBranchPlus,
} from 'lucide-react'
import type { TrailTheme } from './types'

type TrailBannerIconProps = ComponentProps<typeof Braces> & {
  theme: TrailTheme
}

function assertNeverTheme(theme: never): never {
  throw new Error(`Tema de trilha sem icone configurado: ${theme}`)
}

export function TrailBannerIcon({ theme, ...props }: TrailBannerIconProps) {
  switch (theme) {
    case 'backend':
      return createElement(Braces, props)
    case 'frontend':
      return createElement(Code2, props)
    case 'ai':
      return createElement(BrainCircuit, props)
    case 'cicd':
      return createElement(GitBranchPlus, props)
    case 'devops':
      return createElement(CloudCog, props)
    default:
      return assertNeverTheme(theme)
  }
}
