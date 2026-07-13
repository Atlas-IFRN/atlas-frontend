import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FeedPostCard } from '../../components/feed'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import { useFeedPost } from '../../hooks/useFeed'
import '../../components/feed/Feed.css'

/**
 * Página de link permanente de uma publicação (baseada no UUID na URL).
 * Serve para compartilhamento e, no futuro, para busca / destaque de posts.
 */
export default function PostPermalinkPage() {
  const { postId } = useParams<{ postId: string }>()
  const { user } = useAuth()
  const currentUserName = user?.fullName || user?.firstName || 'Você'

  const { data: post, isLoading, isError, refetch } = useFeedPost(postId)

  return (
    <main className="feed-page feed-page--single">
      <div className="post-permalink">
        <Link className="post-permalink__back" to="/inicio">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={2} />
          Voltar ao feed
        </Link>

        {isLoading ? (
          <LoadingState message="Carregando publicação..." skeletonCount={1} />
        ) : isError ? (
          <ErrorState
            message="Não foi possível carregar esta publicação."
            onRetry={() => void refetch()}
          />
        ) : !post ? (
          <EmptyState
            description="A publicação pode ter sido removida."
            title="Publicação não encontrada"
          />
        ) : (
          <FeedPostCard
            currentUserName={currentUserName}
            defaultCommentsOpen
            post={post}
          />
        )}
      </div>
    </main>
  )
}
