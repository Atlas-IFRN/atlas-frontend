import { useEffect, useMemo, useState } from 'react'
import { Newspaper } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  BannerManageModal,
  FeedComposer,
  FeedFilters,
  FeedHero,
  FeedLeftRail,
  FeedPostCard,
  FeedRightRail,
  type FeedFilter,
} from '../../components/feed'
import { Button } from '../../components/atoms/Button'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import { useFeedPosts } from '../../hooks/useFeed'
import { useBanners } from '../../hooks/useBanners'
import { useActiveScholarships, useTopTracks } from '../../hooks/useWidgets'
import { bannerToSlide } from '../../services/banners'
import type { AvatarColor } from '../../components/atoms/Avatar'
import { HERO_SLIDES } from './feedData'
import '../../components/feed/Feed.css'

function isTeacherRole(role: string) {
  return ['teacher', 'professor'].includes(role.trim().toLowerCase())
}

const EMPTY_COPY: Record<FeedFilter, { title: string; description: string }> = {
  principal: {
    title: 'Nenhuma publicação ainda',
    description: 'Seja o primeiro a compartilhar algo com a comunidade.',
  },
  'mais-curtidos': {
    title: 'Nenhuma publicação curtida ainda',
    description: 'As publicações com mais curtidas aparecerão aqui.',
  },
  docentes: {
    title: 'Sem publicações de docentes',
    description: 'Quando um professor publicar, aparecerá aqui.',
  },
  sistema: {
    title: 'Nenhum comunicado do sistema',
    description: 'Avisos oficiais do ATLAS aparecerão aqui.',
  },
}

export default function FeedPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<FeedFilter>('principal')
  const [isBannerModalOpen, setBannerModalOpen] = useState(false)
  const isTeacher = Boolean(user && isTeacherRole(user.role))

  // Mesmo nome exibido no cabeçalho (TopBar): usa o primeiro nome.
  const currentUserName = user?.firstName || 'Usuário ATLAS'

  const { data: banners = [] } = useBanners()
  // Widgets das laterais: bolsas ativas (global) e minhas trilhas (usuário logado).
  const { data: activeScholarships = [], isLoading: scholarshipsLoading } = useActiveScholarships()
  const { data: myTracks = [], isLoading: tracksLoading } = useTopTracks()
  const heroSlides = useMemo(
    () => [...HERO_SLIDES, ...banners.map(bannerToSlide)],
    [banners],
  )

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeedPosts(filter)

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) ?? [],
    [data],
  )

  useEffect(() => {
    const description =
      'Feed do ATLAS — atualizações da comunidade, bolsas, comunicados e o progresso das suas trilhas.'
    let metaDescription = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    )

    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.name = 'description'
      document.head.appendChild(metaDescription)
    }

    metaDescription.content = description
  }, [])

  return (
    <main className="feed-page">
      <FeedHero
        onManageBanners={isTeacher ? () => setBannerModalOpen(true) : undefined}
        slides={heroSlides}
      />

      {isBannerModalOpen ? (
        <BannerManageModal onClose={() => setBannerModalOpen(false)} />
      ) : null}

      <div className="feed-layout">
        <FeedLeftRail scholarships={activeScholarships} isLoading={scholarshipsLoading} />

        <div className="feed-main">
          <FeedComposer
            currentUserAvatar={user?.image || undefined}
            currentUserColor={'blue' as AvatarColor}
            currentUserName={currentUserName}
          />

          <FeedFilters active={filter} onChange={setFilter} />

          {isLoading ? (
            <LoadingState message="Carregando publicações..." skeletonCount={3} />
          ) : isError ? (
            <ErrorState
              message="Não foi possível carregar o feed agora."
              onRetry={() => void refetch()}
            />
          ) : posts.length === 0 ? (
            <EmptyState
              description={EMPTY_COPY[filter].description}
              icon={Newspaper}
              title={EMPTY_COPY[filter].title}
            />
          ) : (
            <>
              {posts.map((post) => (
                <FeedPostCard
                  currentUserName={currentUserName}
                  key={post.id}
                  post={post}
                />
              ))}

              {hasNextPage ? (
                <div className="feed-load-more">
                  <Button
                    disabled={isFetchingNextPage}
                    onClick={() => void fetchNextPage()}
                    variant="soft"
                  >
                    {isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>

        <FeedRightRail tracks={myTracks} isLoading={tracksLoading} />
      </div>
    </main>
  )
}
