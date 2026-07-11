import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  AboutCard,
  NotasPreviewSection,
  ProfileHeader,
  ProfileSidebar,
  ProfileStatsRow,
} from '../../components/perfil/ProfileComponents'
import '../../components/perfil/Profile.css'
import '../../components/feed/Feed.css'
import { ErrorState } from '../../components/states/ErrorState'
import { LoadingState } from '../../components/states/LoadingState'
import { useAuth } from '../../contexts/AuthContext'

function ProfileLoading() {
  return (
    <div className="profile-loading" aria-label="Carregando perfil">
      <div className="profile-loading__header" />
      <LoadingState skeletonCount={4} />
      <LoadingState skeletonCount={2} />
    </div>
  )
}

export default function ProfilePage() {
  const { refreshUser, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let isActive = true

    refreshUser()
      .then((refreshedUser) => {
        if (isActive && !refreshedUser) {
          setLoadError(true)
        }
      })
      .catch(() => {
        if (isActive) {
          setLoadError(true)
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [refreshUser, retryKey])

  function retry() {
    setLoading(true)
    setLoadError(false)
    setRetryKey((key) => key + 1)
  }

  function showEditToast() {
    toast.info('A edição do perfil estará disponível em breve.')
  }

  function showShareToast() {
    toast.success('Link do perfil pronto para compartilhar.')
  }

  const isTeacher = ['teacher', 'professor'].includes(user?.role.toLowerCase() ?? '')

  return (
    <div className="profile-page">
      {loading ? (
        <ProfileLoading />
      ) : loadError || !user ? (
        <ErrorState
          title="Não foi possível carregar seu perfil"
          message="O serviço de autenticação não retornou seus dados. Tente novamente."
          onRetry={retry}
        />
      ) : (
        <>
          <ProfileHeader user={user} onEdit={showEditToast} onShare={showShareToast} />
          <ProfileStatsRow />
          <div className="profile-detail-grid">
            <div className="profile-main">
              <AboutCard bio={user.aboutMe} />
              {!isTeacher ? <NotasPreviewSection /> : null}
            </div>
            <ProfileSidebar />
          </div>
        </>
      )}
    </div>
  )
}
