import { useEffect, useMemo, useState } from 'react'
import { Newspaper } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
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
import type { AvatarColor } from '../../components/atoms/Avatar'
import { ACTIVE_SCHOLARSHIPS, HERO_SLIDES, MY_TRACKS } from './feedData'
import '../../components/feed/Feed.css'

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

  const currentUserName = user?.fullName || user?.firstName || 'Você'

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
      <FeedHero slides={HERO_SLIDES} />

      <div className="feed-layout">
        <FeedLeftRail scholarships={ACTIVE_SCHOLARSHIPS} />

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

        <FeedRightRail tracks={MY_TRACKS} />
      </div>
    </main>
  )
}
