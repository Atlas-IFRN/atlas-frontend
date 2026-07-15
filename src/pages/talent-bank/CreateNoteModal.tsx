import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../components/atoms/Button'
import { FilterTag } from '../../components/atoms/FilterTag'
import { UserChip } from '../../components/molecules/UserChip'
import { ErrorState, LoadingState } from '../../components/states'
import { getCourseLabel } from '../../lib/course-label'
import { getUserProfileById } from '../../services/auth'
import {
  createStudentNote,
  getNoteErrorMessage,
  type NoteSkillTag,
} from '../../services/notes'
import './NotesPage.css'

interface CreateNoteModalProps {
  isCovered?: boolean
  onChangeStudent?: () => void
  onClose: () => void
  onSaved: () => void
  studentId: string
}

interface FormErrors {
  content?: string
  tags?: string
}

const MAX_CONTENT_LENGTH = 2000
const NOTE_TAGS: Array<{ id: NoteSkillTag; label: string }> = [
  { id: 'SOFT_SKILL', label: 'Soft Skill' },
  { id: 'HARD_SKILL', label: 'Hard Skill' },
]

function studentDetails(
  matricula: string,
  courseName: string,
  period: number | null,
) {
  return [
    matricula,
    courseName ? getCourseLabel(courseName) : null,
    period !== null ? `${period}º período` : null,
  ]
    .filter((detail): detail is string => Boolean(detail))
    .join(' · ')
}

function validateForm(content: string, tags: NoteSkillTag[]): FormErrors {
  const errors: FormErrors = {}
  const normalizedContent = content.trim()

  if (!normalizedContent) {
    errors.content = 'Escreva uma anotação para o aluno.'
  }

  if (tags.length === 0) {
    errors.tags = 'Selecione ao menos um marcador.'
  }

  return errors
}

export function CreateNoteModal({
  isCovered = false,
  onChangeStudent,
  onClose,
  onSaved,
  studentId,
}: CreateNoteModalProps) {
  const queryClient = useQueryClient()
  const titleId = useId()
  const contentErrorId = useId()
  const tagsErrorId = useId()
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<NoteSkillTag[]>([])
  const [submitted, setSubmitted] = useState(false)
  const studentQuery = useQuery({
    queryKey: ['user-profile', studentId],
    queryFn: () => getUserProfileById(studentId),
    enabled: Boolean(studentId),
  })
  const errors = useMemo(
    () => validateForm(content, selectedTags),
    [content, selectedTags],
  )
  const isFormValid = Object.keys(errors).length === 0
  const createNoteMutation = useMutation({
    mutationFn: createStudentNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Nota salva com sucesso.')
      onSaved()
    },
  })
  const isSaving = createNoteMutation.isPending
  const isSavingRef = useRef(isSaving)
  const isCoveredRef = useRef(isCovered)
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    isSavingRef.current = isSaving
  }, [isSaving])

  useEffect(() => {
    isCoveredRef.current = isCovered
  }, [isCovered])

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!dialogRef.current?.contains(document.activeElement)) {
      dialogRef.current?.focus()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Tab' && !isCoveredRef.current) {
        const dialog = dialogRef.current
        const focusableElements = dialog
          ? Array.from(
              dialog.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
              ),
            )
          : []
        const firstElement = focusableElements[0]
        const lastElement = focusableElements.at(-1)
        const activeElement = document.activeElement

        if (!firstElement || !lastElement) {
          event.preventDefault()
          dialog?.focus()
          return
        }

        if (
          event.shiftKey &&
          (activeElement === firstElement || !dialog?.contains(activeElement))
        ) {
          event.preventDefault()
          lastElement.focus()
          return
        }

        if (
          !event.shiftKey &&
          (activeElement === lastElement || !dialog?.contains(activeElement))
        ) {
          event.preventDefault()
          firstElement.focus()
          return
        }
      }

      if (
        event.key === 'Escape' &&
        !isSavingRef.current &&
        !isCoveredRef.current
      ) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedElement?.focus()
    }
  }, [onClose])

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !isSaving) {
      onClose()
    }
  }

  function toggleTag(tag: NoteSkillTag) {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag],
    )
    createNoteMutation.reset()
  }

  function handleContentChange(value: string) {
    setContent(value)
    createNoteMutation.reset()
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)

    if (!isFormValid) {
      return
    }

    createNoteMutation.mutate({
      content: content.trim(),
      studentId,
      tags: selectedTags,
    })
  }

  const student = studentQuery.data
  const contentError = submitted ? errors.content : undefined
  const tagsError = submitted ? errors.tags : undefined

  return createPortal(
    <div
      aria-hidden={isCovered || undefined}
      className="create-note-modal"
      inert={isCovered || undefined}
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="create-note-modal__dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="create-note-modal__header">
          <h2 id={titleId}>Nova nota</h2>
          <Button
            aria-label="Fechar criação de nota"
            disabled={isSaving}
            iconLeft={X}
            onClick={onClose}
            size="sm"
            variant="ghost"
          />
        </header>

        {studentQuery.isLoading ? (
          <LoadingState
            className="create-note-modal__loading"
            message="Carregando aluno..."
            variant="spinner"
          />
        ) : studentQuery.isError || !student ? (
          <div className="create-note-modal__load-error">
            <ErrorState
              message="Não foi possível carregar os dados deste aluno."
              onRetry={() => void studentQuery.refetch()}
            />
            <Button onClick={onClose} variant="outline">
              Cancelar
            </Button>
          </div>
        ) : (
          <form
            aria-busy={isSaving}
            className="create-note-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="create-note-form__student">
              <UserChip
                name={student.fullName || student.firstName}
                role={studentDetails(
                  student.matricula,
                  student.courseName,
                  student.period,
                )}
                size="md"
                src={student.image || undefined}
              />
              {onChangeStudent ? (
                <Button
                  disabled={isSaving}
                  onClick={onChangeStudent}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Trocar
                </Button>
              ) : null}
            </div>

            <label className="create-note-form__field">
              <span>Anotação</span>
              <textarea
                aria-describedby={contentError ? contentErrorId : undefined}
                aria-invalid={Boolean(contentError)}
                aria-required="true"
                autoFocus
                disabled={isSaving}
                maxLength={MAX_CONTENT_LENGTH}
                onBlur={() => setSubmitted(true)}
                onChange={(event) => handleContentChange(event.target.value)}
                placeholder="Descreva conhecimentos, habilidades e observações sobre o aluno..."
                required
                rows={6}
                value={content}
              />
              <small className="create-note-form__counter">
                {content.length}/{MAX_CONTENT_LENGTH}
              </small>
              {contentError ? (
                <small className="create-note-form__error" id={contentErrorId}>
                  {contentError}
                </small>
              ) : null}
            </label>

            <fieldset
              aria-describedby={tagsError ? tagsErrorId : undefined}
              aria-invalid={Boolean(tagsError)}
              aria-required="true"
              className="create-note-form__markers"
            >
              <legend>Marcadores</legend>
              <div>
                {NOTE_TAGS.map((tag) => (
                  <FilterTag
                    active={selectedTags.includes(tag.id)}
                    disabled={isSaving}
                    key={tag.id}
                    label={tag.label}
                    onClick={() => toggleTag(tag.id)}
                  />
                ))}
              </div>
              {tagsError ? (
                <small className="create-note-form__error" id={tagsErrorId}>
                  {tagsError}
                </small>
              ) : null}
            </fieldset>

            {createNoteMutation.isError ? (
              <p className="create-note-form__submit-error" role="alert">
                {getNoteErrorMessage(createNoteMutation.error)}
              </p>
            ) : null}

            <footer className="create-note-form__actions">
              <Button
                disabled={isSaving}
                onClick={onClose}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                disabled={!isFormValid}
                loading={isSaving}
                type="submit"
              >
                Salvar nota
              </Button>
            </footer>
          </form>
        )}
      </section>
    </div>,
    document.body,
  )
}
