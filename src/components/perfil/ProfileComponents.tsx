import { ArrowRight, Pencil, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { AuthUser } from '../../contexts/AuthContext'
import {
  MINHAS_NOTAS,
  tagLabel,
  type NoteTag,
  type ProfileNote,
} from '../../lib/notas-mock'
import { Avatar } from '../atoms/Avatar'
import { Button } from '../atoms/Button'
import { ButtonLink } from '../atoms/ButtonLink'
import { StatCard } from '../atoms/StatCard'
import { StatusBadge, type StatusBadgeStatus } from '../atoms/StatusBadge'
import { RailTrackList } from '../feed/rails/RailTrackList'
import { InfoCard } from '../molecules/InfoCard'
import { EmptyState } from '../states/EmptyState'
import { ProfileAchievementsCard } from './ProfileAchievementsCard'
import { PROFILE_STATS, PROFILE_TRACKS } from './profileData'

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

function periodLabel(period: number) {
  return `${period}º período`
}

function courseLabel(courseName: string) {
  const normalizedCourseName = courseName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  if (normalizedCourseName.includes('analise e desenvolvimento de sistemas')) {
    return 'ADS'
  }

  return courseName
}

function formatIra(ira: number) {
  return ira.toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 1,
  })
}

const noteTagStatus: Record<NoteTag, StatusBadgeStatus> = {
  'ponto-forte': 'completed',
  'soft-skill': 'primary',
  atencao: 'warning',
}

interface ProfileIdentityProps {
  user: AuthUser
}

export function ProfileIdentity({ user }: ProfileIdentityProps) {
  const name = user.firstName || 'Usuário ATLAS'
  const isStudent = ['student', 'aluno'].includes(user.role.toLowerCase())
  const identityDetails = [
    roleLabel(user.role),
    user.courseName ? courseLabel(user.courseName) : null,
    user.period !== null ? periodLabel(user.period) : null,
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
          {isStudent && user.ira !== null ? (
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
  onEdit: () => void
  onShare: () => void
}

export function ProfileHeader({ user, onEdit, onShare }: ProfileHeaderProps) {
  return (
    <header className="profile-header card">
      <div className="profile-header__cover" aria-hidden="true" />
      <div className="profile-header__body">
        <ProfileIdentity user={user} />
        <div className="profile-header__actions">
          <Button variant="outline" size="sm" iconLeft={Pencil} onClick={onEdit}>
            Editar perfil
          </Button>
          <Button size="sm" iconLeft={Share2} onClick={onShare}>
            Compartilhar
          </Button>
        </div>
      </div>
    </header>
  )
}

export function ProfileStatsRow() {
  return (
    <section className="profile-stats" aria-label="Resumo do perfil">
      {PROFILE_STATS.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          tone={stat.tone}
          actionLabel={stat.actionLabel}
          actionHref={stat.actionHref}
          actionAriaLabel={stat.actionAriaLabel}
        />
      ))}
    </section>
  )
}

export function AboutCard({ bio }: { bio: string }) {
  return (
    <InfoCard className="profile-about" title="Sobre">
      <p>{bio || 'Nenhuma informação adicionada ao perfil.'}</p>
    </InfoCard>
  )
}

export function NotePreviewCard({ note }: { note: ProfileNote }) {
  return (
    <Link className="profile-note" to="/notas" aria-label={`Ver nota de ${note.professor}`}>
      <Avatar name={note.professor} color="blue" size="sm" />
      <div className="profile-note__content">
        <div className="profile-note__heading">
          <strong>Prof. {note.professor}</strong>
          <span>{note.context}</span>
        </div>
        <p>“{note.excerpt}”</p>
        <div className="profile-note__tags">
          {note.tags.map((tag) => (
            <StatusBadge key={tag} size="sm" status={noteTagStatus[tag]}>
              {tagLabel(tag)}
            </StatusBadge>
          ))}
        </div>
      </div>
    </Link>
  )
}

export function NotasPreviewSection({
  notes = MINHAS_NOTAS,
}: {
  notes?: ProfileNote[]
}) {
  return (
    <section className="profile-notes" aria-labelledby="profile-notes-title">
      <header className="profile-notes__header">
        <h2 id="profile-notes-title">Notas dos professores</h2>
        <ButtonLink size="sm" to="/notas" variant="soft">
          Ver todas <ArrowRight aria-hidden="true" size={18} />
        </ButtonLink>
      </header>
      <div className="profile-notes__body">
        {notes.length ? (
          <div className="profile-notes__list">
            {notes.slice(0, 3).map((note) => (
              <NotePreviewCard note={note} key={note.id} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma nota recebida"
            description="Seus feedbacks aparecerão aqui quando forem publicados."
          />
        )}
      </div>
    </section>
  )
}

interface ProfileSidebarProps {
  user: AuthUser
  onEdit: () => void
}

export function ProfileSidebar({ user, onEdit }: ProfileSidebarProps) {
  return (
    <aside className="profile-detail-side">
      <ProfileLinksCard user={user} onEdit={onEdit} />
      <RailTrackList tracks={PROFILE_TRACKS} />
      <ProfileAchievementsCard />
    </aside>
  )
}

export function ProfileLinksCard({ user, onEdit }: ProfileSidebarProps) {
  return (
    <InfoCard
      className="profile-links"
      title="Links"
      action={(
        <Button onClick={onEdit} size="sm" variant="soft">
          Editar
        </Button>
      )}
    >
      <div className="profile-links__list">
        <a
          className="profile-social-link"
          href={user.github || 'https://github.com/'}
          rel="noreferrer"
          target="_blank"
        >
          <svg
            aria-hidden="true"
            className="profile-social-link__icon"
            viewBox="0 0 24 24"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          <span>
            <strong>GitHub</strong>
            <small>{user.github ? user.github.replace(/^https?:\/\//, '') : 'Adicionar ao perfil'}</small>
          </span>
        </a>
        <a
          className="profile-social-link"
          href={user.linkedin || 'https://www.linkedin.com/'}
          rel="noreferrer"
          target="_blank"
        >
          <span aria-hidden="true" className="profile-social-link__linkedin-icon">
            in
          </span>
          <span>
            <strong>LinkedIn</strong>
            <small>{user.linkedin ? user.linkedin.replace(/^https?:\/\//, '') : 'Adicionar ao perfil'}</small>
          </span>
        </a>
      </div>
    </InfoCard>
  )
}
