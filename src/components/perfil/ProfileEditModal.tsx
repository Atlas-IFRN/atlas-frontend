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

interface ProfileEditModalProps {
  user: AuthUser
  onClose: () => void
  onSave: (fields: EditableProfileFields) => Promise<void>
}

function isValidOptionalUrl(value: string) {
  if (!value.trim()) {
    return true
  }

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function ProfileEditModal({ user, onClose, onSave }: ProfileEditModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const aboutInputRef = useRef<HTMLTextAreaElement>(null)
  const [fields, setFields] = useState<EditableProfileFields>({
    aboutMe: user.aboutMe,
    linkedin: user.linkedin,
    github: user.github,
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

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

  function updateField(field: keyof EditableProfileFields, value: string) {
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

    if (!isValidOptionalUrl(fields.github) || !isValidOptionalUrl(fields.linkedin)) {
      setError('Informe links completos começando com http:// ou https://.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await onSave({
        aboutMe: fields.aboutMe.trim(),
        linkedin: fields.linkedin.trim(),
        github: fields.github.trim(),
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

          <div className="profile-edit-form__links">
            <label className="profile-edit-field">
              <span className="profile-edit-field__label">
                <Code2 aria-hidden="true" size={16} /> GitHub
              </span>
              <input
                inputMode="url"
                maxLength={200}
                onChange={(event) => updateField('github', event.target.value)}
                placeholder="https://github.com/seu-usuario"
                type="url"
                value={fields.github}
              />
            </label>

            <label className="profile-edit-field">
              <span className="profile-edit-field__label">
                <Briefcase aria-hidden="true" size={16} /> LinkedIn
              </span>
              <input
                inputMode="url"
                maxLength={200}
                onChange={(event) => updateField('linkedin', event.target.value)}
                placeholder="https://linkedin.com/in/seu-usuario"
                type="url"
                value={fields.linkedin}
              />
            </label>
          </div>

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
