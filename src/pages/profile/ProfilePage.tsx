import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  AboutCard,
  NotasPreviewSection,
  ProfileHeader,
  ProfileSidebar,
} from '../../components/perfil/ProfileComponents'
import { ProfileEditModal } from '../../components/perfil/ProfileEditModal'
import '../../components/perfil/Profile.css'
import '../../components/feed/Feed.css'
import { ErrorState } from '../../components/states/ErrorState'
import { LoadingState } from '../../components/states/LoadingState'
import { useAuth } from '../../contexts/AuthContext'

function ProfileLoading() {
  return (
    <div className="profile-loading" aria-label="Carregando perfil">
      <div className="profile-loading__header" />
      <LoadingState skeletonCount={2} />
    </div>
  )
}

async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  const copied = document.execCommand('copy')
  textarea.remove()

  if (!copied) {
    throw new Error('Clipboard unavailable')
  }
}

export default function ProfilePage() {
  const { refreshUser, updateProfile, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

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

  async function saveProfile(fields: Parameters<typeof updateProfile>[0]) {
    await updateProfile(fields)
    setIsEditModalOpen(false)
    toast.success('Perfil atualizado com sucesso.')
  }

  async function shareProfile() {
    if (!user) {
      return
    }

    const profileUrl = new URL(
      `/perfil/${encodeURIComponent(user.matricula)}`,
      window.location.origin,
    ).toString()
    const shareData = {
      title: `Perfil de ${user.fullName || user.firstName}`,
      text: `Veja o perfil de ${user.fullName || user.firstName} no ATLAS.`,
      url: profileUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast.success('Perfil compartilhado com sucesso.')
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
      }
    }

    try {
      await copyToClipboard(profileUrl)
      toast.success('Link do perfil copiado.')
    } catch {
      toast.error('Não foi possível compartilhar o perfil.')
    }
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
          <ProfileHeader
            user={user}
            onEdit={() => setIsEditModalOpen(true)}
            onShare={shareProfile}
          />
          <div className="profile-detail-grid">
            <div className="profile-main">
              <AboutCard bio={user.aboutMe} />
              {!isTeacher ? <NotasPreviewSection /> : null}
            </div>
            <ProfileSidebar user={user} onEdit={() => setIsEditModalOpen(true)} />
          </div>
          {isEditModalOpen ? (
            <ProfileEditModal
              onClose={() => setIsEditModalOpen(false)}
              onSave={saveProfile}
              user={user}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
