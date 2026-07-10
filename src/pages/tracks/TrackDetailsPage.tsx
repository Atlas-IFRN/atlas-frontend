import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { ButtonLink } from '../../components/atoms/ButtonLink'
import { InfoCard } from '../../components/molecules/InfoCard'
import {
  ErrorState,
  LoadingState,
} from '../../components/states'
import {
  TrailBreadcrumb,
  TrailDetailHero,
  TrailDetailSidebar,
  TrailDetailTabs,
  TrailEvaluationCard,
  TrailModulesPanel,
  TrailOutcomes,
  TrailPrerequisites,
  TrailProfessorBlock,
  type TrailDetailTab,
} from '../../components/trilhas'
import { useTrack } from '../../hooks/useTracks'
import '../../components/trilhas/TrailsCatalog.css'

function setMetaContent(
  selector: string,
  attr: 'name' | 'property',
  attrValue: string,
  content: string,
) {
  let meta = document.querySelector<HTMLMetaElement>(selector)

  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attr, attrValue)
    document.head.appendChild(meta)
  }

  meta.content = content
}

function isNotFoundError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false
  }

  const response = 'response' in error ? error.response : undefined

  return (
    response !== null &&
    response !== undefined &&
    typeof response === 'object' &&
    'status' in response &&
    response.status === 404
  )
}

function TrailNotFound() {
  return (
    <main className="trail-detail-page">
      <section className="trail-detail-not-found">
        <AlertCircle aria-hidden="true" size={36} strokeWidth={1.8} />
        <div>
          <h1>Trilha não encontrada</h1>
          <p>
            O endereço informado não corresponde a nenhuma trilha disponível no
            catálogo.
          </p>
        </div>
        <ButtonLink to="/trilhas" variant="primary">
          Voltar para trilhas
        </ButtonLink>
      </section>
    </main>
  )
}

export default function TrackDetailsPage() {
  const { trackId } = useParams()
  const [activeTab, setActiveTab] = useState<TrailDetailTab>('overview')
  const {
    data: trail,
    error,
    isError,
    isLoading,
    refetch,
  } = useTrack(trackId)

  useEffect(() => {
    if (!trail) {
      document.title = 'ATLAS · Trilha não encontrada'
      return
    }

    document.title = `ATLAS · ${trail.title}`
    setMetaContent(
      'meta[name="description"]',
      'name',
      'description',
      trail.description,
    )
    setMetaContent(
      'meta[property="og:title"]',
      'property',
      'og:title',
      `ATLAS · ${trail.title}`,
    )
    setMetaContent(
      'meta[property="og:description"]',
      'property',
      'og:description',
      trail.description,
    )
  }, [trail])

  if (!trackId || isNotFoundError(error)) {
    return <TrailNotFound />
  }

  if (isLoading) {
    return (
      <main className="trail-detail-page">
        <LoadingState
          message="Carregando detalhes da trilha..."
          skeletonCount={3}
          variant="skeleton"
        />
      </main>
    )
  }

  if (isError) {
    return (
      <main className="trail-detail-page">
        <ErrorState
          message="Não foi possível carregar os detalhes desta trilha agora."
          onRetry={() => void refetch()}
        />
      </main>
    )
  }

  if (!trail) {
    return <TrailNotFound />
  }

  return (
    <main className="trail-detail-page">
      <TrailBreadcrumb title={trail.title} />
      <TrailDetailHero trail={trail} />
      <TrailDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="trail-detail-layout">
        <div className="trail-detail-main">
          {activeTab === 'overview' ? (
            <>
              <InfoCard
                className="trail-detail-info-card"
                title="Sobre esta trilha"
              >
                <div className="trail-detail-rich-text">
                  {trail.longDescription.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </InfoCard>

              {trail.outcomes.length > 0 ? (
                <TrailOutcomes outcomes={trail.outcomes} />
              ) : null}
              <TrailEvaluationCard evaluation={trail.evaluation} />
              {trail.prerequisites.length > 0 ? (
                <TrailPrerequisites prerequisites={trail.prerequisites} />
              ) : null}
              <TrailProfessorBlock teacher={trail.teacher} />
            </>
          ) : (
            <TrailModulesPanel modules={trail.modulesList} />
          )}
        </div>

        <TrailDetailSidebar trail={trail} />
      </div>
    </main>
  )
}
