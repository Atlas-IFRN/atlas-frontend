import { useState } from 'react'
import type { AvatarColor } from '../../atoms/Avatar'
import {
  addReply,
  countComments,
  createComment,
  toggleCommentLike,
} from './commentTree'
import { PostActions } from './PostActions'
import { PostBody } from './PostBody'
import { PostEmbed } from './PostEmbed'
import { PostHeader } from './PostHeader'
import { PostLinkPreview } from './PostLinkPreview'
import { PostMedia } from './PostMedia'
import type { FeedPost, PostComment } from '../../../types/feed'
import { PostComments } from './PostComments'

interface PostCardProps {
  post: FeedPost
  currentUserName: string
  currentUserColor?: AvatarColor
}

const LONG_VARIANTS: FeedPost['variant'][] = ['long-text', 'image-long']

export function PostCard({
  post,
  currentUserName,
  currentUserColor = 'blue',
}: PostCardProps) {
  const [liked, setLiked] = useState(post.liked ?? false)
  const [likes, setLikes] = useState(post.likes)
  const [comments, setComments] = useState<PostComment[]>(post.comments)
  const [commentsOpen, setCommentsOpen] = useState(false)

  const isLong = LONG_VARIANTS.includes(post.variant)

  function handleToggleLike() {
    // Setters separados e puros: aninhar setLikes dentro do updater de setLiked
    // faz a contagem mudar em ±2 sob StrictMode (updaters são chamados 2x).
    setLikes((count) => count + (liked ? -1 : 1))
    setLiked((current) => !current)
  }

  function handleAddComment(content: string) {
    const author = {
      id: 'me',
      name: currentUserName,
      role: 'Você',
      avatarColor: currentUserColor,
    }
    setComments((current) => [...current, createComment(author, content)])
  }

  function handleReply(parentId: string, content: string) {
    const author = {
      id: 'me',
      name: currentUserName,
      role: 'Você',
      avatarColor: currentUserColor,
    }
    setComments((current) =>
      addReply(current, parentId, createComment(author, content)),
    )
  }

  function handleToggleCommentLike(commentId: string) {
    setComments((current) => toggleCommentLike(current, commentId))
  }

  return (
    <article className="post">
      <PostHeader author={post.author} time={post.time} />

      <PostBody content={post.content} expandable={isLong} />

      {post.media ? <PostMedia media={post.media} /> : null}
      {post.linkPreview ? (
        <PostLinkPreview preview={post.linkPreview} />
      ) : null}
      {post.embed ? <PostEmbed embed={post.embed} /> : null}

      <PostActions
        commentsCount={countComments(comments)}
        commentsOpen={commentsOpen}
        liked={liked}
        likes={likes}
        onToggleComments={() => setCommentsOpen((open) => !open)}
        onToggleLike={handleToggleLike}
        shares={post.shares}
      />

      {commentsOpen ? (
        <PostComments
          comments={comments}
          currentUserName={currentUserName}
          onAddComment={handleAddComment}
          onReply={handleReply}
          onToggleLike={handleToggleCommentLike}
        />
      ) : null}
    </article>
  )
}
