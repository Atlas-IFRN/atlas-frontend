import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../components/atoms/Button'
import { EmptyState, ErrorState, LoadingState } from '../../components/states'
import { useFeedPost, useUpdatePost } from '../../hooks/useFeed'
import { getFeedRequestErrorMessage } from '../../services/feed'
import { useAuth } from '../../contexts/AuthContext'
import '../../components/feed/Feed.css'

export default function EditPostPage() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: post, isLoading, isError, refetch } = useFeedPost(postId)
  const updatePost = useUpdatePost(postId ?? '')
  const [content, setContent] = useState('')

  // Preenche o textarea uma vez, quando o post carrega (ajuste em tempo de
  // render, sem efeito).
  const [loadedId, setLoadedId] = useState<string | undefined>(undefined)
  if (post && loadedId !== post.id) {
    setLoadedId(post.id)
    setContent(post.content)
  }

  const isOwner = Boolean(post && user && user.id === post.author.id)

  function handleSave() {
    updatePost.mutate(
      { content: content.trim() },
      {
        onSuccess: () => {
          toast.success('Publicação atualizada.')
          navigate(`/inicio/post/${postId}`)
        },
        onError: (error) =>
          toast.error(
            getFeedRequestErrorMessage(error, 'Não foi possível salvar.'),
          ),
      },
    )
  }

  return (
    <main className="feed-page feed-page--single">
      <div className="post-permalink">
        <Link className="post-permalink__back" to="/inicio">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={2} />
          Voltar ao feed
        </Link>

        <h1 className="post-permalink__title">Editar publicação</h1>

        {isLoading ? (
          <LoadingState message="Carregando publicação..." skeletonCount={1} />
        ) : isError ? (
          <ErrorState
            message="Não foi possível carregar a publicação."
            onRetry={() => void refetch()}
          />
        ) : !post ? (
          <EmptyState title="Publicação não encontrada" />
        ) : !isOwner ? (
          <EmptyState
            description="Você só pode editar as suas próprias publicações."
            title="Sem permissão"
          />
        ) : (
          <div className="composer">
            <textarea
              className="composer__standalone"
              onChange={(event) => setContent(event.target.value)}
              value={content}
            />
            <div className="composer__foot">
              <span className="composer__spacer" />
              <Button
                onClick={() => navigate(`/inicio/post/${postId}`)}
                size="sm"
                variant="ghost"
              >
                Cancelar
              </Button>
              <Button
                disabled={updatePost.isPending || !content.trim()}
                onClick={handleSave}
                size="sm"
                variant="primary"
              >
                {updatePost.isPending ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
