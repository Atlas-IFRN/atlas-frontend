import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { Briefcase, Code2, UserRound, X } from 'lucide-react'
import type {
  AuthUser,
  EditableProfileFields,
} from '../../contexts/AuthContext'
import { Button } from '../atoms/Button'
import {
  buildGithubProfileUrl,
  buildLinkedinProfileUrl,
  extractGithubUsername,
  extractLinkedinUsername,
  isValidGithubUsername,
  isValidLinkedinUsername,
} from '../../utils/socialProfiles'

interface ProfileEditModalProps {
  user: AuthUser
  onClose: () => void
  onSave: (fields: EditableProfileFields) => Promise<void>
}

interface ProfileFormFields {
  aboutMe: string
  githubUsername: string
  linkedinUsername: string
}

function isTeacherRole(role: string) {
  return ['teacher', 'professor'].includes(role.trim().toLowerCase())
}

export function ProfileEditModal({ user, onClose, onSave }: ProfileEditModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const aboutInputRef = useRef<HTMLTextAreaElement>(null)
  const [fields, setFields] = useState<ProfileFormFields>({
    aboutMe: user.aboutMe,
    githubUsername: extractGithubUsername(user.github),
    linkedinUsername: extractLinkedinUsername(user.linkedin),
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const isTeacher = isTeacherRole(user.role)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    aboutInputRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !saving) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, saving])

  function updateField(field: keyof ProfileFormFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }))
    setError('')
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !saving) {
      onClose()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isTeacher && !isValidGithubUsername(fields.githubUsername)) {
      setError(
        'O usuário do GitHub deve ter até 39 letras, números ou hífens, sem hífens seguidos ou nas extremidades.',
      )
      return
    }

    if (!isTeacher && !isValidLinkedinUsername(fields.linkedinUsername)) {
      setError(
        'O identificador do LinkedIn deve ter entre 3 e 100 letras, números ou hífens.',
      )
      return
    }

    setSaving(true)
    setError('')

    try {
      await onSave({
        aboutMe: fields.aboutMe.trim(),
        linkedin: isTeacher
          ? user.linkedin
          : buildLinkedinProfileUrl(fields.linkedinUsername),
        github: isTeacher
          ? user.github
          : buildGithubProfileUrl(fields.githubUsername),
      })
    } catch {
      setError('Não foi possível salvar o perfil. Revise os dados e tente novamente.')
      setSaving(false)
    }
  }

  return createPortal(
    <div
      className="profile-edit-modal"
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="profile-edit-modal__dialog"
        role="dialog"
      >
        <header className="profile-edit-modal__header">
          <div className="profile-edit-modal__heading-icon" aria-hidden="true">
            <UserRound size={22} />
          </div>
          <div>
            <p className="profile-edit-modal__eyebrow">Perfil público</p>
            <h2 id={titleId}>Editar perfil</h2>
            <p id={descriptionId}>
              Complete as informações pessoais que não são fornecidas pelo SUAP.
            </p>
          </div>
          <Button
            aria-label="Fechar edição do perfil"
            className="profile-edit-modal__close"
            disabled={saving}
            iconLeft={X}
            onClick={onClose}
            size="sm"
            variant="ghost"
          />
        </header>

        <form className="profile-edit-form" onSubmit={handleSubmit}>
          <label className="profile-edit-field">
            <span className="profile-edit-field__label">Sobre você</span>
            <textarea
              ref={aboutInputRef}
              maxLength={1000}
              onChange={(event) => updateField('aboutMe', event.target.value)}
              placeholder="Conte brevemente sobre seus interesses, experiências e objetivos."
              rows={5}
              value={fields.aboutMe}
            />
            <small>{fields.aboutMe.length}/1000 caracteres</small>
          </label>

          {!isTeacher ? (
            <div className="profile-edit-form__links">
              <label className="profile-edit-field">
                <span className="profile-edit-field__label">
                  <Code2 aria-hidden="true" size={16} /> GitHub
                </span>
                <div className="profile-edit-handle">
                  <span aria-hidden="true">github.com/</span>
                  <input
                    aria-label="Nome de usuário do GitHub"
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    maxLength={39}
                    onChange={(event) =>
                      updateField('githubUsername', event.target.value)
                    }
                    placeholder="seu-usuario"
                    spellCheck={false}
                    type="text"
                    value={fields.githubUsername}
                  />
                </div>
              </label>

              <label className="profile-edit-field">
                <span className="profile-edit-field__label">
                  <Briefcase aria-hidden="true" size={16} /> LinkedIn
                </span>
                <div className="profile-edit-handle">
                  <span aria-hidden="true">linkedin.com/in/</span>
                  <input
                    aria-label="Identificador do perfil no LinkedIn"
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    maxLength={100}
                    onChange={(event) =>
                      updateField('linkedinUsername', event.target.value)
                    }
                    placeholder="seu-usuario"
                    spellCheck={false}
                    type="text"
                    value={fields.linkedinUsername}
                  />
                </div>
              </label>
            </div>
          ) : null}

          <div className="profile-edit-form__notice">
            Nome, matrícula, curso, campus e demais dados acadêmicos são sincronizados automaticamente.
          </div>

          {error ? (
            <p className="profile-edit-form__error" role="alert">{error}</p>
          ) : null}

          <footer className="profile-edit-form__actions">
            <Button disabled={saving} onClick={onClose} type="button" variant="outline">
              Cancelar
            </Button>
            <Button loading={saving} type="submit">
              Salvar alterações
            </Button>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  )
}
