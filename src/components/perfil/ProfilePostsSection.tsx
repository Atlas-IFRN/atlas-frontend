import { useMemo } from 'react'
import { Newspaper } from 'lucide-react'
import { Button } from '../atoms/Button'
import { FeedPostCard } from '../feed'
import { EmptyState, ErrorState, LoadingState } from '../states'
import { useAuth } from '../../contexts/AuthContext'
import { useUserFeedPosts } from '../../hooks/useFeed'

interface ProfilePostsSectionProps {
  matricula: string
  isOwnProfile?: boolean
}

export function ProfilePostsSection({
  matricula,
  isOwnProfile = false,
}: ProfilePostsSectionProps) {
  const { user } = useAuth()
  const postsQuery = useUserFeedPosts(matricula)
  const posts = useMemo(
    () => postsQuery.data?.pages.flatMap((page) => page.posts) ?? [],
    [postsQuery.data],
  )
  const postsCount = postsQuery.data?.pages[0]?.count ?? 0
  const currentUserName = user?.firstName || 'Usuário ATLAS'

  return (
    <section className="profile-posts" aria-labelledby="profile-posts-title">
      <header className="profile-posts__header">
        <span className="profile-posts__icon" aria-hidden="true">
          <Newspaper size={20} strokeWidth={1.9} />
        </span>
        <div className="profile-posts__heading">
          <h2 id="profile-posts-title">Publicações</h2>
          <p>Atividades e contribuições compartilhadas no ATLAS.</p>
        </div>
        {!postsQuery.isLoading && !postsQuery.isError ? (
          <span className="profile-posts__count">
            {postsCount} {postsCount === 1 ? 'publicação' : 'publicações'}
          </span>
        ) : null}
      </header>

      {postsQuery.isLoading ? (
        <LoadingState
          className="profile-posts__state"
          message="Carregando publicações"
          skeletonCount={2}
        />
      ) : postsQuery.isError ? (
        <ErrorState
          className="profile-posts__state"
          title="Não foi possível carregar as publicações"
          message="O feed está indisponível no momento. Tente novamente."
          onRetry={() => void postsQuery.refetch()}
        />
      ) : posts.length === 0 ? (
        <EmptyState
          className="profile-posts__state"
          icon={Newspaper}
          title="Nenhuma publicação ainda"
          description={
            isOwnProfile
              ? 'Quando você compartilhar algo no feed, a publicação também aparecerá no seu perfil.'
              : 'Quando este usuário compartilhar algo no feed, a publicação aparecerá aqui.'
          }
        />
      ) : (
        <>
          <div className="profile-posts__list">
            {posts.map((post) => (
              <FeedPostCard
                currentUserName={currentUserName}
                key={post.id}
                post={post}
              />
            ))}
          </div>

          {postsQuery.hasNextPage ? (
            <div className="profile-posts__load-more">
              <Button
                disabled={postsQuery.isFetchingNextPage}
                variant="outline"
                onClick={() => void postsQuery.fetchNextPage()}
              >
                {postsQuery.isFetchingNextPage
                  ? 'Carregando...'
                  : 'Carregar mais publicações'}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
