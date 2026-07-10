import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/atoms/Button'
import { ScholarshipFormPage } from '../../components/scholarships'
import { ErrorState, LoadingState } from '../../components/states'
import { getScholarship } from '../../services/scholarships'
import '../../components/scholarships/form/ScholarshipFormPage.css'

export default function EditScholarshipPage() {
  const { scholarshipId } = useParams()
  const navigate = useNavigate()

  const scholarshipQuery = useQuery({
    queryKey: ['scholarships', 'detail', scholarshipId],
    queryFn: () => {
      if (!scholarshipId) {
        throw new Error('Bolsa não informada.')
      }

      return getScholarship(scholarshipId)
    },
    enabled: Boolean(scholarshipId),
  })

  if (!scholarshipId) {
    return (
      <section className="scholarship-create-page">
        <ErrorState
          title="Bolsa não informada"
          message="Volte para a listagem e selecione uma bolsa para editar."
          action={
            <Button iconLeft={ArrowLeft} onClick={() => navigate('/bolsas')}>
              Voltar para bolsas
            </Button>
          }
        />
      </section>
    )
  }

  if (scholarshipQuery.isLoading) {
    return (
      <section className="scholarship-create-page">
        <LoadingState
          message="Carregando dados da bolsa"
          skeletonCount={3}
          variant="skeleton"
        />
      </section>
    )
  }

  if (scholarshipQuery.isError || !scholarshipQuery.data) {
    return (
      <section className="scholarship-create-page">
        <ErrorState
          message="Não foi possível carregar a bolsa para edição."
          onRetry={() => scholarshipQuery.refetch()}
        />
      </section>
    )
  }

  return (
    <ScholarshipFormPage
      key={scholarshipQuery.data.id}
      initialScholarship={scholarshipQuery.data}
      mode="edit"
    />
  )
}
