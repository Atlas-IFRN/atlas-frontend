import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ButtonLink } from '../../../components/atoms/ButtonLink'
import { ErrorState, LoadingState } from '../../../components/states'
import { getModuleById } from '../../../services/tracks'

export default function ModuleDetailsPage() {
  const navigate = useNavigate()
  const { trackId, moduleId } = useParams()
  const moduleQuery = useQuery({
    queryKey: ['tracks', trackId, 'modules', moduleId],
    queryFn: () => getModuleById(moduleId as string),
    enabled: Boolean(trackId && moduleId),
  })

  const firstContent = [...(moduleQuery.data?.contents ?? [])].sort(
    (current, next) => (current.display_order ?? 0) - (next.display_order ?? 0),
  )[0]

  useEffect(() => {
    if (!trackId || !moduleId || !firstContent) {
      return
    }

    navigate(
      `/trilhas/${trackId}/modulos/${moduleId}/conteudos/${firstContent.id}`,
      { replace: true },
    )
  }, [firstContent, moduleId, navigate, trackId])

  if (!trackId || !moduleId) {
    return <Navigate replace to="/trilhas" />
  }

  if (moduleQuery.isLoading || firstContent) {
    return (
      <main className="route-page">
        <LoadingState
          message="Abrindo primeira aula do módulo..."
          skeletonCount={2}
          variant="skeleton"
        />
      </main>
    )
  }

  if (moduleQuery.isError) {
    return (
      <main className="route-page">
        <ErrorState
          message="Não foi possível abrir este módulo. Confirme sua matrícula e tente novamente."
          onRetry={() => void moduleQuery.refetch()}
        />
        <ButtonLink to={`/trilhas/${trackId}`} variant="outline">
          Voltar para a trilha
        </ButtonLink>
      </main>
    )
  }

  return (
    <main className="route-page">
      <ErrorState message="Este módulo ainda não possui conteúdos disponíveis." />
      <ButtonLink to={`/trilhas/${trackId}`} variant="outline">
        Voltar para a trilha
      </ButtonLink>
    </main>
  )
}
