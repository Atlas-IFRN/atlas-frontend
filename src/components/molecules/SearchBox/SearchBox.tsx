import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, BriefcaseBusiness, ChevronRight, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Avatar } from '../../atoms/Avatar'
import { SearchInput } from '../../atoms/SearchInput'
import { useDebounce } from '../../../hooks/useDebounce'
import { SEARCH_MIN_LENGTH, useGlobalSearch } from '../../../hooks/useGlobalSearch'
import {
  profileToRow,
  scholarshipToRow,
  trackToRow,
  type SearchRow,
} from '../../../services/search'
import './SearchBox.css'

const DEFAULT_PLACEHOLDER = 'Buscar trilhas, bolsas, pessoas...'

/** Quantos resultados por seção o dropdown mostra antes do "Ver todos". */
const PREVIEW_LIMIT = 4

interface SearchBoxProps {
  className?: string
  placeholder?: string
}

interface SectionState {
  rows: SearchRow[]
  count: number
  isLoading: boolean
  isError: boolean
}

interface SectionConfig {
  key: string
  title: string
  icon: LucideIcon
  state: SectionState
}

/**
 * Barra de busca do cabeçalho + dropdown de sugestões, com uma seção por
 * serviço (Trilhas, Bolsas, Perfis). Digitar dispara a busca (debounced);
 * clicar num resultado navega ao destino; Enter ou "Ver todos" leva à página
 * de resultados expandidos (/busca?q=).
 */
export function SearchBox({ className, placeholder = DEFAULT_PLACEHOLDER }: SearchBoxProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const debounced = useDebounce(query, 300)
  const { enabled, tracks, scholarships, profiles } = useGlobalSearch(debounced, PREVIEW_LIMIT)

  // Fecha ao clicar fora ou apertar Escape (mesmo padrão do menu do perfil).
  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const sections = useMemo<SectionConfig[]>(
    () => [
      {
        key: 'tracks',
        title: 'Trilhas',
        icon: BookOpen,
        state: {
          rows: (tracks.data?.results ?? []).map(trackToRow),
          count: tracks.data?.count ?? 0,
          isLoading: tracks.isLoading,
          isError: tracks.isError,
        },
      },
      {
        key: 'scholarships',
        title: 'Bolsas',
        icon: BriefcaseBusiness,
        state: {
          rows: (scholarships.data?.results ?? []).map(scholarshipToRow),
          count: scholarships.data?.count ?? 0,
          isLoading: scholarships.isLoading,
          isError: scholarships.isError,
        },
      },
      {
        key: 'profiles',
        title: 'Perfis',
        icon: UserRound,
        state: {
          rows: (profiles.data?.results ?? []).map(profileToRow),
          count: profiles.data?.count ?? 0,
          isLoading: profiles.isLoading,
          isError: profiles.isError,
        },
      },
    ],
    [tracks, scholarships, profiles],
  )

  function goToResults() {
    const trimmed = query.trim()
    if (trimmed.length < SEARCH_MIN_LENGTH) {
      return
    }
    setOpen(false)
    navigate(`/busca?q=${encodeURIComponent(trimmed)}`)
  }

  function handleSelect(to: string) {
    setOpen(false)
    setQuery('')
    navigate(to)
  }

  const boxClassName = ['search-box', className].filter(Boolean).join(' ')
  const showDropdown = open && enabled

  return (
    <div className={boxClassName} ref={containerRef}>
      <SearchInput
        aria-label="Buscar"
        aria-expanded={showDropdown}
        placeholder={placeholder}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            goToResults()
          }
        }}
      />

      {showDropdown ? (
        <div className="search-box__dropdown" role="dialog" aria-label="Sugestões de busca">
          {sections.map((section) => (
            <SearchSection
              key={section.key}
              config={section}
              onSelect={handleSelect}
              onSeeAll={goToResults}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

interface SearchSectionProps {
  config: SectionConfig
  onSelect: (to: string) => void
  onSeeAll: () => void
}

function SearchSection({ config, onSelect, onSeeAll }: SearchSectionProps) {
  const { title, icon: Icon, state } = config
  const hasMore = state.count > state.rows.length

  return (
    <section className="search-section" aria-label={title}>
      <header className="search-section__header">
        <Icon aria-hidden="true" size={15} />
        <span>{title}</span>
      </header>

      {state.isLoading ? (
        <p className="search-section__hint">Buscando…</p>
      ) : state.isError ? (
        <p className="search-section__hint">Não foi possível buscar.</p>
      ) : state.rows.length === 0 ? (
        <p className="search-section__hint">Sem resultado</p>
      ) : (
        <ul className="search-section__list">
          {state.rows.map((row) => (
            <li key={row.key}>
              <button
                type="button"
                className="search-result"
                onClick={() => onSelect(row.to)}
              >
                {row.avatar ? (
                  <Avatar
                    className="search-result__avatar"
                    name={row.avatar.name}
                    src={row.avatar.src}
                    size="sm"
                  />
                ) : null}
                <span className="search-result__text">
                  <span className="search-result__primary">{row.primary}</span>
                  {row.secondary ? (
                    <span className="search-result__secondary">{row.secondary}</span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {hasMore ? (
        <button type="button" className="search-section__see-all" onClick={onSeeAll}>
          Ver todos ({state.count})
          <ChevronRight aria-hidden="true" size={14} />
        </button>
      ) : null}
    </section>
  )
}
