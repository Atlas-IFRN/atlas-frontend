import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookOpen, BriefcaseBusiness, SearchX, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Avatar } from '../../components/atoms/Avatar'
import { EmptyState } from '../../components/states/EmptyState'
import { ErrorState } from '../../components/states/ErrorState'
import { LoadingState } from '../../components/states/LoadingState'
import { SEARCH_MIN_LENGTH, useGlobalSearch } from '../../hooks/useGlobalSearch'
import {
  profileToRow,
  scholarshipToRow,
  trackToRow,
  type SearchRow,
} from '../../services/search'
import './SearchResultsPage.css'

/** Quantos resultados por seção a página expandida busca. */
const PAGE_LIMIT = 24

interface Section {
  key: string
  title: string
  icon: LucideIcon
  emptyLabel: string
  rows: SearchRow[]
  count: number
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export default function SearchResultsPage() {
  const [params] = useSearchParams()
  const query = (params.get('q') ?? '').trim()
  const { enabled, tracks, scholarships, profiles } = useGlobalSearch(query, PAGE_LIMIT)

  const sections = useMemo<Section[]>(
    () => [
      {
        key: 'tracks',
        title: 'Trilhas',
        icon: BookOpen,
        emptyLabel: 'Nenhuma trilha encontrada.',
        rows: (tracks.data?.results ?? []).map(trackToRow),
        count: tracks.data?.count ?? 0,
        isLoading: tracks.isLoading,
        isError: tracks.isError,
        refetch: () => void tracks.refetch(),
      },
      {
        key: 'scholarships',
        title: 'Bolsas',
        icon: BriefcaseBusiness,
        emptyLabel: 'Nenhuma bolsa encontrada.',
        rows: (scholarships.data?.results ?? []).map(scholarshipToRow),
        count: scholarships.data?.count ?? 0,
        isLoading: scholarships.isLoading,
        isError: scholarships.isError,
        refetch: () => void scholarships.refetch(),
      },
      {
        key: 'profiles',
        title: 'Perfis',
        icon: UserRound,
        emptyLabel: 'Nenhum perfil encontrado.',
        rows: (profiles.data?.results ?? []).map(profileToRow),
        count: profiles.data?.count ?? 0,
        isLoading: profiles.isLoading,
        isError: profiles.isError,
        refetch: () => void profiles.refetch(),
      },
    ],
    [tracks, scholarships, profiles],
  )

  return (
    <section className="search-page">
      <header className="search-page__header">
        <h1>Busca</h1>
        {query ? (
          <p>
            Resultados para <strong>“{query}”</strong>
          </p>
        ) : (
          <p>Digite algo na barra de busca para começar.</p>
        )}
      </header>

      {!enabled ? (
        <EmptyState
          icon={SearchX}
          title="Busque por trilhas, bolsas ou pessoas"
          description={`Informe ao menos ${SEARCH_MIN_LENGTH} caracteres para ver resultados.`}
        />
      ) : (
        <div className="search-page__sections">
          {sections.map((section) => (
            <ResultSection key={section.key} section={section} />
          ))}
        </div>
      )}
    </section>
  )
}

function ResultSection({ section }: { section: Section }) {
  const { title, icon: Icon, emptyLabel } = section

  return (
    <section className="search-page-section" aria-label={title}>
      <header className="search-page-section__header">
        <Icon aria-hidden="true" size={18} />
        <h2>{title}</h2>
        {!section.isLoading && !section.isError ? (
          <span className="search-page-section__count">{section.count}</span>
        ) : null}
      </header>

      {section.isLoading ? (
        <LoadingState variant="skeleton" skeletonCount={3} />
      ) : section.isError ? (
        <ErrorState
          message={`Não foi possível buscar ${title.toLowerCase()}.`}
          onRetry={section.refetch}
        />
      ) : section.rows.length === 0 ? (
        <p className="search-page-section__empty">{emptyLabel}</p>
      ) : (
        <ul className="search-page-section__list">
          {section.rows.map((row) => (
            <li key={row.key}>
              <Link className="search-page-result" to={row.to}>
                {row.avatar ? (
                  <Avatar
                    className="search-page-result__avatar"
                    name={row.avatar.name}
                    src={row.avatar.src}
                    size="md"
                  />
                ) : null}
                <span className="search-page-result__text">
                  <span className="search-page-result__primary">{row.primary}</span>
                  {row.secondary ? (
                    <span className="search-page-result__secondary">{row.secondary}</span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
