import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useParams } from 'react-router-dom'
import {
  AboutCard,
  ProfileHeader,
  ProfileSidebar,
  StudentNotesSummaryCard,
} from '../../components/perfil/ProfileComponents'
import { StudentNotesModal } from '../../components/perfil/StudentNotesModal'
import '../../components/perfil/Profile.css'
import '../../components/feed/Feed.css'
import { ErrorState } from '../../components/states/ErrorState'
import { LoadingState } from '../../components/states/LoadingState'
import { useAuth } from '../../contexts/AuthContext'
import { MINHAS_NOTAS } from '../../lib/notas-mock'
import { getUserProfile } from '../../services/auth'
import ProfilePage from './ProfilePage'

const PROFILE_MODAL_NOTES = MINHAS_NOTAS.map((note) => ({
  ...note,
  tags: [note.tag],
}))

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

export default function UserProfilePage() {
  const { matricula } = useParams<{ matricula: string }>()
  const { user } = useAuth()
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
  const lookup = matricula?.trim() ?? ''
  const isOwnProfile = Boolean(lookup && lookup === user?.matricula)
  const profileQuery = useQuery({
    queryKey: ['user-profile', lookup],
    queryFn: () => getUserProfile(lookup),
    enabled: Boolean(lookup && !isOwnProfile),
  })
  const profile = profileQuery.data
  const isTeacherViewer = ['teacher', 'professor'].includes(
    user?.role.trim().toLowerCase() ?? '',
  )
  const isStudentProfile = ['student', 'aluno'].includes(
    profile?.role.trim().toLowerCase() ?? '',
  )

  if (isOwnProfile) {
    return <ProfilePage />
  }

  function retry() {
    void profileQuery.refetch()
  }

  async function shareProfile() {
    if (!profile || !lookup) {
      return
    }

    const profileUrl = new URL(
      `/perfil/${encodeURIComponent(lookup)}`,
      window.location.origin,
    ).toString()
    const profileName = profile.fullName || profile.firstName
    const shareData = {
      title: `Perfil de ${profileName}`,
      text: `Veja o perfil de ${profileName} no ATLAS.`,
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

  return (
    <div className="profile-page">
      {profileQuery.isLoading ? (
        <ProfileLoading />
      ) : profileQuery.isError || !profile ? (
        <ErrorState
          title="Não foi possível carregar este perfil"
          message="O usuário não foi encontrado ou o serviço de autenticação está indisponível."
          onRetry={retry}
        />
      ) : (
        <>
          <ProfileHeader
            user={profile}
            onShare={shareProfile}
            showPrivateDetails={false}
          />
          <div className="profile-detail-grid">
            <div className="profile-main">
              <AboutCard bio={profile.aboutMe} />
              {isTeacherViewer && isStudentProfile ? (
                <StudentNotesSummaryCard
                  notesCount={MINHAS_NOTAS.length}
                  onOpen={() => setIsNotesModalOpen(true)}
                />
              ) : null}
            </div>
            <ProfileSidebar user={profile} />
          </div>
          {isTeacherViewer && isStudentProfile && isNotesModalOpen ? (
            <StudentNotesModal
              notes={PROFILE_MODAL_NOTES}
              onClose={() => setIsNotesModalOpen(false)}
              student={profile}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
