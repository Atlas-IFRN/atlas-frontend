import {
  ArrowRight,
  FileText,
  MessageSquareText,
  Pencil,
  Share2,
} from 'lucide-react'
import type { AuthUser } from '../../contexts/AuthContext'
import { useAuth } from '../../contexts/AuthContext'
import { getCourseLabel } from '../../lib/course-label'
import {
  buildGithubProfileUrl,
  buildLinkedinProfileUrl,
  extractGithubUsername,
  extractLinkedinUsername,
} from '../../utils/socialProfiles'
import { Avatar } from '../atoms/Avatar'
import { Button } from '../atoms/Button'
import { ButtonLink } from '../atoms/ButtonLink'
import { RailTrackList } from '../feed/rails/RailTrackList'
import { InfoCard } from '../molecules/InfoCard'
import { ProfileAchievementsCard } from './ProfileAchievementsCard'
import { useTopTracks } from '../../hooks/useWidgets'

function roleLabel(role: string) {
  const normalizedRole = role.trim().toLowerCase()

  if (['teacher', 'professor'].includes(normalizedRole)) {
    return 'Professor'
  }

  if (['student', 'aluno'].includes(normalizedRole)) {
    return 'Estudante'
  }

  return role || 'Usuário'
}

function isTeacherRole(role: string) {
  return ['teacher', 'professor'].includes(role.trim().toLowerCase())
}

function periodLabel(period: number) {
  return `${period}º período`
}

function formatIra(ira: number) {
  return ira.toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 1,
  })
}

interface ProfileIdentityProps {
  user: AuthUser
  showPrivateDetails?: boolean
}

export function ProfileIdentity({
  user,
  showPrivateDetails = true,
}: ProfileIdentityProps) {
  const name = user.firstName || 'Usuário ATLAS'
  const isStudent = ['student', 'aluno'].includes(user.role.toLowerCase())
  const identityDetails = [
    roleLabel(user.role),
    user.courseName ? getCourseLabel(user.courseName) : null,
    isStudent && user.period !== null ? periodLabel(user.period) : null,
  ].filter((detail): detail is string => Boolean(detail))

  return (
    <div className="profile-identity">
      <Avatar
        className="profile-identity__avatar"
        color="blue"
        name={name}
        src={user.image || undefined}
        size="lg"
      />
      <div className="profile-identity__content">
        <h1>{name}</h1>
        <p className="profile-identity__eyebrow">
          {identityDetails.map((detail, index) => (
            <span key={detail}>
              {index > 0 ? <span aria-hidden="true"> • </span> : null}
              {detail}
            </span>
          ))}
        </p>
        <dl className="profile-identity__meta">
          <div>
            <dt>Matrícula</dt>
            <dd>{user.matricula || 'Não informada'}</dd>
          </div>
          <div>
            <dt>Campus</dt>
            <dd>{user.institutionName || 'Não informado'}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{user.email || 'Não informado'}</dd>
          </div>
          {showPrivateDetails && isStudent && user.ira !== null ? (
            <div>
              <dt>IRA</dt>
              <dd>{formatIra(user.ira)}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </div>
  )
}

interface ProfileHeaderProps {
  user: AuthUser
  onEdit?: () => void
  onShare: () => void
  showPrivateDetails?: boolean
}

export function ProfileHeader({
  user,
  onEdit,
  onShare,
  showPrivateDetails = true,
}: ProfileHeaderProps) {
  const headerClassName = isTeacherRole(user.role)
    ? 'profile-header profile-header--teacher card'
    : 'profile-header card'

  return (
    <header className={headerClassName}>
      <div className="profile-header__cover" aria-hidden="true" />
      <div className="profile-header__body">
        <ProfileIdentity
          user={user}
          showPrivateDetails={showPrivateDetails}
        />
        <div className="profile-header__actions">
          {onEdit ? (
            <Button variant="outline" size="sm" iconLeft={Pencil} onClick={onEdit}>
              Editar perfil
            </Button>
          ) : null}
          <Button size="sm" iconLeft={Share2} onClick={onShare}>
            Compartilhar
          </Button>
        </div>
      </div>
    </header>
  )
}

export function AboutCard({ bio }: { bio: string }) {
  return (
    <InfoCard className="profile-about" title="Sobre">
      <p>{bio || 'Nenhuma informação adicionada ao perfil.'}</p>
    </InfoCard>
  )
}

type StudentNotesSummaryCardProps = {
  isError?: boolean
  isLoading?: boolean
  notesCount: number
} & ({ onOpen: () => void; to?: never } | { onOpen?: never; to: string })

export function StudentNotesSummaryCard(props: StudentNotesSummaryCardProps) {
  const { isError = false, isLoading = false, notesCount } = props
  const countLabel = notesCount === 1 ? 'nota cadastrada' : 'notas cadastradas'

  return (
    <section
      aria-labelledby="student-notes-summary-title"
      className="student-notes-summary"
    >
      <div className="student-notes-summary__icon" aria-hidden="true">
        <MessageSquareText size={22} />
      </div>
      <div className="student-notes-summary__content">
        <h2 id="student-notes-summary-title">Notas dos professores</h2>
        <p aria-live="polite">
          {isLoading ? (
            'Carregando notas...'
          ) : isError ? (
            'Não foi possível carregar a contagem.'
          ) : (
            <>
              <strong>{notesCount}</strong> {countLabel}
            </>
          )}
        </p>
      </div>
      {typeof props.to === 'string' ? (
        <ButtonLink size="sm" to={props.to} variant="soft">
          Ver notas <ArrowRight aria-hidden="true" size={18} />
        </ButtonLink>
      ) : (
        <Button
          aria-haspopup="dialog"
          iconRight={ArrowRight}
          onClick={props.onOpen}
          size="sm"
          variant="soft"
        >
          Ver notas
        </Button>
      )}
    </section>
  )
}

interface ProfileSidebarProps {
  user: AuthUser
}

export function ProfileSidebar({ user }: ProfileSidebarProps) {
  const { user: currentUser } = useAuth()
  const isTeacher = isTeacherRole(user.role)
  const isOwnProfile = currentUser?.id === user.id
  // Trilhas deste perfil, ordenadas por progresso (professor não se matricula,
  // então nem busca).
  const { data: tracks = [], isLoading: tracksLoading } = useTopTracks(user.id, !isTeacher)

  return (
    <aside className="profile-detail-side">
      <ProfileLinksCard user={user} />
      {!isTeacher ? (
        <>
          <RailTrackList
            tracks={tracks}
            isLoading={tracksLoading}
            title={isOwnProfile ? 'Minhas trilhas' : 'Trilhas em andamento'}
          />
          <ProfileAchievementsCard userId={user.id} />
        </>
      ) : null}
    </aside>
  )
}

export function ProfileLinksCard({ user }: ProfileSidebarProps) {
  const { user: currentUser } = useAuth()
  const isOwnProfile = currentUser?.id === user.id

  if (isTeacherRole(user.role)) {
    const lattesUrl = user.curriculoLattes.trim()

    return (
      <InfoCard className="profile-links" title="Currículo Lattes">
        <div className="profile-links__list">
          {lattesUrl ? (
            <a
              className="profile-social-link"
              href={lattesUrl}
              rel="noreferrer"
              target="_blank"
            >
              <FileText
                aria-hidden="true"
                className="profile-lattes-link__icon"
              />
              <span>
                <strong>Plataforma Lattes</strong>
                <small>Acessar currículo acadêmico</small>
              </span>
            </a>
          ) : (
            <div
              aria-label="Currículo Lattes não informado"
              className="profile-social-link profile-social-link--unavailable"
            >
              <FileText
                aria-hidden="true"
                className="profile-lattes-link__icon"
              />
              <span>
                <strong>Plataforma Lattes</strong>
                <small>Currículo não informado</small>
              </span>
            </div>
          )}
        </div>
      </InfoCard>
    )
  }

  const githubUsername = extractGithubUsername(user.github)
  const linkedinUsername = extractLinkedinUsername(user.linkedin)
  const githubUrl = buildGithubProfileUrl(githubUsername)
  const linkedinUrl = buildLinkedinProfileUrl(linkedinUsername)
  const missingLinkLabel = isOwnProfile ? 'Adicionar ao perfil' : 'Não informado'
  const githubContent = (
    <>
      <svg
        aria-hidden="true"
        className="profile-social-link__icon"
        viewBox="0 0 24 24"
      >
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
      <span>
        <strong>GitHub</strong>
        <small>
          {githubUsername ? `github.com/${githubUsername}` : missingLinkLabel}
        </small>
      </span>
    </>
  )
  const linkedinContent = (
    <>
      <span aria-hidden="true" className="profile-social-link__linkedin-icon">
        in
      </span>
      <span>
        <strong>LinkedIn</strong>
        <small>
          {linkedinUsername
            ? `linkedin.com/in/${linkedinUsername}`
            : missingLinkLabel}
        </small>
      </span>
    </>
  )

  return (
    <InfoCard className="profile-links" title="Links">
      <div className="profile-links__list">
        {githubUrl ? (
          <a
            className="profile-social-link"
            href={githubUrl}
            rel="noreferrer"
            target="_blank"
          >
            {githubContent}
          </a>
        ) : (
          <div
            aria-label={`GitHub: ${missingLinkLabel}`}
            className="profile-social-link profile-social-link--unavailable"
          >
            {githubContent}
          </div>
        )}
        {linkedinUrl ? (
          <a
            className="profile-social-link"
            href={linkedinUrl}
            rel="noreferrer"
            target="_blank"
          >
            {linkedinContent}
          </a>
        ) : (
          <div
            aria-label={`LinkedIn: ${missingLinkLabel}`}
            className="profile-social-link profile-social-link--unavailable"
          >
            {linkedinContent}
          </div>
        )}
      </div>
    </InfoCard>
  )
}
