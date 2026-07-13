import { useEffect } from 'react'
import { matchPath, useLocation } from 'react-router-dom'

const APP_NAME = 'ATLAS'

const routeTitles = [
  { path: '/entrar', title: 'Entrar' },
  { path: '/auth/callback', title: 'Entrando' },
  { path: '/componentes', title: 'Componentes' },
  { path: '/inicio/novo', title: 'Novo post' },
  { path: '/inicio/:postId/editar', title: 'Editar post' },
  { path: '/inicio', title: 'Início' },
  { path: '/bolsas/minhas-candidaturas', title: 'Minhas candidaturas' },
  { path: '/bolsas/candidaturas', title: 'Minhas candidaturas' },
  { path: '/bolsas/nova', title: 'Nova bolsa' },
  { path: '/bolsas/:scholarshipId/editar', title: 'Editar bolsa' },
  { path: '/bolsas/:scholarshipId/candidaturas', title: 'Candidaturas' },
  { path: '/bolsas/:scholarshipId', title: 'Detalhes da bolsa' },
  { path: '/bolsas', title: 'Bolsas' },
  { path: '/perfil/editar', title: 'Editar perfil' },
  { path: '/perfil/:matricula', title: 'Perfil do usuário' },
  { path: '/perfil', title: 'Meu Perfil' },
  { path: '/trilhas/nova', title: 'Nova trilha' },
  { path: '/trilhas/:trackId/editar', title: 'Editar trilha' },
  { path: '/trilhas/:trackId/modulos/novo', title: 'Novo módulo' },
  { path: '/trilhas/:trackId/modulos/:moduleId/editar', title: 'Editar módulo' },
  {
    path: '/trilhas/:trackId/modulos/:moduleId/conteudos/novo',
    title: 'Novo conteúdo',
  },
  {
    path: '/trilhas/:trackId/modulos/:moduleId/conteudos/:contentId/editar',
    title: 'Editar conteúdo',
  },
  {
    path: '/trilhas/:trackId/modulos/:moduleId/conteudos/:contentId',
    title: 'Conteúdo',
  },
  { path: '/trilhas/:trackId/modulos/:moduleId', title: 'Módulo' },
  { path: '/trilhas/:trackId', title: 'Detalhes da trilha' },
  { path: '/trilhas', title: 'Trilhas' },
  { path: '/banco-talentos/minhas-notas', title: 'Minhas notas' },
  { path: '/notas', title: 'Minhas notas' },
  { path: '/banco-talentos/:studentId/notas/nova', title: 'Nova nota' },
  { path: '/banco-talentos/:studentId/notas', title: 'Notas do estudante' },
  { path: '/banco-talentos', title: 'Banco de talentos' },
  { path: '/professor', title: 'Painel do professor' },
]

function getTitle(pathname: string) {
  const routeTitle = routeTitles.find(({ path }) =>
    matchPath({ path, end: true }, pathname),
  )

  return routeTitle ? `${routeTitle.title} | ${APP_NAME}` : APP_NAME
}

export function DocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = getTitle(pathname)

    const description =
      pathname === '/perfil' ||
      Boolean(matchPath({ path: '/perfil/:matricula', end: true }, pathname))
        ? 'Acompanhe sua identidade, progresso, conquistas e reputação no ATLAS.'
        : 'ATLAS — aprendizagem, talentos e oportunidades.'
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')

    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }

    meta.content = description
  }, [pathname])

  return null
}
