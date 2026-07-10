import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  FeedFilters,
  FeedHero,
  FeedLeftRail,
  FeedRightRail,
  PostCard,
  PostComposer,
  SystemPost,
  type FeedFilter,
} from '../../components/feed'
import {
  ACTIVE_SCHOLARSHIPS,
  FEED_POSTS,
  HERO_SLIDES,
  MY_TRACKS,
  SYSTEM_POSTS,
} from './feedData'
import '../../components/feed/Feed.css'

export default function FeedPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<FeedFilter>('for-you')

  const currentUserName = user?.fullName || user?.firstName || 'Maria Santos'

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
          <PostComposer currentUserName={currentUserName} />

          <FeedFilters active={filter} onChange={setFilter} />

          {SYSTEM_POSTS.map((post) => (
            <SystemPost key={post.id} post={post} />
          ))}

          {FEED_POSTS.map((post) => (
            <PostCard
              currentUserName={currentUserName}
              key={post.id}
              post={post}
            />
          ))}
        </div>

        <FeedRightRail tracks={MY_TRACKS} />
      </div>
    </main>
  )
}
