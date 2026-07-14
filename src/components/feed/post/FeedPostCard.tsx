import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MoreHorizontal, Pencil, Pin, PinOff, Share2, Trash2 } from 'lucide-react'
import type { FeedPost, PostComment } from '../../../types/feed'
import {
  getFeedRequestErrorMessage,
  setCommentLike,
  setPostLike,
} from '../../../services/feed'
import {
  feedKeys,
  useAddComment,
  useDeletePost,
  useFixPost,
  usePostComments,
} from '../../../hooks/useFeed'
import { useAuth } from '../../../contexts/AuthContext'
import { countComments, toggleCommentLike } from './commentTree'
import { PostActions } from './PostActions'
import { PostBody } from './PostBody'
import { PostComments } from './PostComments'
import { PostEmbed } from './PostEmbed'
import { PostHeader } from './PostHeader'
import { PostLinkPreview } from './PostLinkPreview'
import { PostMedia } from './PostMedia'

interface FeedPostCardProps {
  post: FeedPost
  currentUserName: string
  /** Abre a thread de comentários já expandida (usado na página do post). */
  defaultCommentsOpen?: boolean
}

const LONG_VARIANTS: FeedPost['variant'][] = ['long-text', 'image-long']

/**
 * Copia texto para a área de transferência. Usa a Clipboard API quando
 * disponível (HTTPS/localhost) e cai para o método legado (`execCommand`)
 * em contexto não-seguro (ex.: acesso por HTTP via IP/domínio), onde
 * `navigator.clipboard` é `undefined`. Retorna `true` se copiou.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Cai para o fallback abaixo.
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)
    return copied
  } catch {
    return false
  }
}

function findComment(
  comments: PostComment[],
  id: string,
): PostComment | undefined {
  for (const comment of comments) {
    if (comment.id === id) {
      return comment
    }
    const found = comment.replies && findComment(comment.replies, id)
    if (found) {
      return found
    }
  }
  return undefined
}

export function FeedPostCard({
  post,
  currentUserName,
  defaultCommentsOpen = false,
}: FeedPostCardProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [liked, setLiked] = useState(post.liked ?? false)
  const [likes, setLikes] = useState(post.likes)
  const [commentsOpen, setCommentsOpen] = useState(defaultCommentsOpen)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Ressincroniza o estado otimista de like quando o servidor revalida o post
  // (padrão de ajuste em tempo de render, sem efeito — ver docs do React).
  const serverLikeSig = `${post.liked ?? false}:${post.likes}`
  const [likeSig, setLikeSig] = useState(serverLikeSig)
  if (likeSig !== serverLikeSig) {
    setLikeSig(serverLikeSig)
    setLiked(post.liked ?? false)
    setLikes(post.likes)
  }

  useEffect(() => {
    if (!menuOpen) {
      return
    }
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [menuOpen])

  const isLong = LONG_VARIANTS.includes(post.variant)
  const isOwner = Boolean(user && user.id === post.author.id)

  // Clicar no autor (do post ou de um comentário) leva ao perfil pela matrícula.
  function goToAuthor(author: FeedPost['author']) {
    if (author.matricula) {
      navigate(`/perfil/${encodeURIComponent(author.matricula)}`)
    }
  }
  // Só docentes podem fixar (o backend também valida).
  const normalizedRole = user?.role?.trim().toLowerCase()
  const isTeacher = normalizedRole === 'teacher' || normalizedRole === 'professor'

  const commentsQuery = usePostComments(post.id, commentsOpen)
  const comments = commentsQuery.data ?? []
  const addComment = useAddComment(post.id)
  const deletePostMutation = useDeletePost()
  const fixPostMutation = useFixPost()

  const displayCommentsCount = commentsOpen
    ? undefined
    : (post.commentsCount ?? 0)

  async function handleToggleLike() {
    const nextLiked = !liked
    setLiked(nextLiked)
    setLikes((count) => count + (nextLiked ? 1 : -1))
    try {
      await setPostLike(post.id, nextLiked)
    } catch (error) {
      // Reverte a UI otimista em caso de falha.
      setLiked(!nextLiked)
      setLikes((count) => count + (nextLiked ? -1 : 1))
      toast.error(getFeedRequestErrorMessage(error, 'Não foi possível curtir.'))
    }
  }

  function handleAddComment(content: string) {
    addComment.mutate(
      { content },
      {
        onError: (error) =>
          toast.error(
            getFeedRequestErrorMessage(error, 'Não foi possível comentar.'),
          ),
      },
    )
  }

  function handleReply(parentId: string, content: string) {
    addComment.mutate(
      { content, parentId },
      {
        onError: (error) =>
          toast.error(
            getFeedRequestErrorMessage(error, 'Não foi possível responder.'),
          ),
      },
    )
  }

  async function handleToggleCommentLike(commentId: string) {
    const current = findComment(comments, commentId)
    if (!current) {
      return
    }
    const nextLiked = !current.liked
    // Atualização otimista direto no cache da query de comentários.
    queryClient.setQueryData<PostComment[]>(
      feedKeys.comments(post.id),
      (old) => (old ? toggleCommentLike(old, commentId) : old),
    )
    try {
      await setCommentLike(commentId, nextLiked)
    } catch (error) {
      queryClient.setQueryData<PostComment[]>(
        feedKeys.comments(post.id),
        (old) => (old ? toggleCommentLike(old, commentId) : old),
      )
      toast.error(getFeedRequestErrorMessage(error, 'Não foi possível curtir.'))
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/inicio/post/${post.id}`
    if (await copyToClipboard(url)) {
      toast.success('Link da publicação copiado!')
    } else {
      toast.error('Não foi possível copiar o link.')
    }
  }

  function handleDelete() {
    setMenuOpen(false)
    if (!window.confirm('Excluir esta publicação? Esta ação não pode ser desfeita.')) {
      return
    }
    deletePostMutation.mutate(post.id, {
      onSuccess: () => toast.success('Publicação excluída.'),
      onError: (error) =>
        toast.error(
          getFeedRequestErrorMessage(error, 'Não foi possível excluir.'),
        ),
    })
  }

  function handleToggleFixed() {
    setMenuOpen(false)
    const nextFixed = !post.isFixed
    fixPostMutation.mutate(
      { postId: post.id, fixed: nextFixed },
      {
        onSuccess: () =>
          toast.success(nextFixed ? 'Publicação fixada.' : 'Publicação desafixada.'),
        onError: (error) =>
          toast.error(
            getFeedRequestErrorMessage(error, 'Não foi possível fixar.'),
          ),
      },
    )
  }

  const menu = (
    <div className="post-menu" ref={menuRef}>
      <button
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="post-head__menu"
        onClick={() => setMenuOpen((open) => !open)}
        type="button"
        aria-label="Mais opções"
      >
        <MoreHorizontal aria-hidden="true" size={18} strokeWidth={2} />
      </button>

      {menuOpen ? (
        <div className="post-menu__list" role="menu">
          <button
            className="post-menu__item"
            onClick={() => {
              setMenuOpen(false)
              void handleShare()
            }}
            role="menuitem"
            type="button"
          >
            <Share2 aria-hidden="true" size={15} strokeWidth={2} />
            Compartilhar
          </button>
          {isTeacher ? (
            <button
              className="post-menu__item"
              onClick={handleToggleFixed}
              role="menuitem"
              type="button"
            >
              {post.isFixed ? (
                <>
                  <PinOff aria-hidden="true" size={15} strokeWidth={2} />
                  Desafixar
                </>
              ) : (
                <>
                  <Pin aria-hidden="true" size={15} strokeWidth={2} />
                  Fixar
                </>
              )}
            </button>
          ) : null}
          {isOwner ? (
            <>
              <button
                className="post-menu__item"
                onClick={() => {
                  setMenuOpen(false)
                  navigate(`/inicio/${post.id}/editar`)
                }}
                role="menuitem"
                type="button"
              >
                <Pencil aria-hidden="true" size={15} strokeWidth={2} />
                Editar
              </button>
              <button
                className="post-menu__item post-menu__item--danger"
                onClick={handleDelete}
                role="menuitem"
                type="button"
              >
                <Trash2 aria-hidden="true" size={15} strokeWidth={2} />
                Excluir
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )

  return (
    <article className={`post${post.isFixed ? ' post--fixed' : ''}`}>
      {post.isFixed ? (
        <div className="post-fixed-flag">
          <Pin aria-hidden="true" size={13} strokeWidth={2} />
          Fixado por docente
        </div>
      ) : null}

      <PostHeader
        author={post.author}
        menu={menu}
        onAuthorClick={
          post.author.matricula ? () => goToAuthor(post.author) : undefined
        }
        time={post.time}
      />

      <PostBody content={post.content} expandable={isLong} />

      {post.media ? <PostMedia media={post.media} /> : null}
      {post.linkPreview ? <PostLinkPreview preview={post.linkPreview} /> : null}
      {post.embed ? <PostEmbed embed={post.embed} /> : null}

      <PostActions
        commentsCount={displayCommentsCount ?? countComments(comments)}
        commentsOpen={commentsOpen}
        liked={liked}
        likes={likes}
        onShare={() => void handleShare()}
        onToggleComments={() => setCommentsOpen((open) => !open)}
        onToggleLike={() => void handleToggleLike()}
      />

      {commentsOpen ? (
        commentsQuery.isLoading ? (
          <p className="post-comments__empty">Carregando comentários…</p>
        ) : (
          <PostComments
            comments={comments}
            currentUserAvatar={user?.image || undefined}
            currentUserName={currentUserName}
            onAddComment={handleAddComment}
            onAuthorClick={goToAuthor}
            onReply={handleReply}
            onToggleLike={(commentId) => void handleToggleCommentLike(commentId)}
          />
        )
      ) : null}
    </article>
  )
}
