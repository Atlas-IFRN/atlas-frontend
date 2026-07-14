import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FeedComposer } from '../../components/feed'
import '../../components/feed/Feed.css'

export default function CreatePostPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const currentUserName = user?.fullName || user?.firstName || 'Você'

  return (
    <main className="feed-page feed-page--single">
      <div className="post-permalink">
        <Link className="post-permalink__back" to="/inicio">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={2} />
          Voltar ao feed
        </Link>

        <h1 className="post-permalink__title">Nova publicação</h1>

        <FeedComposer
          currentUserAvatar={user?.image || undefined}
          currentUserName={currentUserName}
          onPublished={() => navigate('/inicio')}
        />
      </div>
    </main>
  )
}
