import { useEffect, useId, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, ArrowRight, Info, LogOut, Star, X } from 'lucide-react'
import { Button } from '../../atoms/Button'
import { ButtonLink } from '../../atoms/ButtonLink'
import { ProgressBar } from '../../atoms/ProgressBar'
import { StatusBadge } from '../../atoms/StatusBadge'
import { useAuth } from '../../../contexts/AuthContext'
import {
  useDropTrackEnrollment,
  useEnrollInTrack,
} from '../../../hooks/useTracks'
import { getTrackRequestErrorMessage } from '../../../services/tracks'
import type { Trail } from '../../../types/tracks'

interface TrailDetailSidebarProps {
  trail: Trail
}

export function TrailDetailSidebar({ trail }: TrailDetailSidebarProps) {
  const progress = trail.progress ?? 0
  const firstModuleId = trail.modulesList[0]?.id
  const workload = trail.hours > 0 ? `~${trail.hours}h` : 'A definir'
  const { user } = useAuth()
  const enrollment = useEnrollInTrack()
  const dropEnrollment = useDropTrackEnrollment()
  const [showDropConfirmation, setShowDropConfirmation] = useState(false)
  const dialogTitleId = useId()
  const dialogDescriptionId = useId()
  const normalizedRole = user?.role.trim().toLowerCase()
  const canEnroll = normalizedRole !== 'teacher' && normalizedRole !== 'professor'
  const canDrop = canEnroll && trail.enrollmentStatus === 'IN_PROGRESS'

  useEffect(() => {
    if (!showDropConfirmation) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !dropEnrollment.isPending) {
        setShowDropConfirmation(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [dropEnrollment.isPending, showDropConfirmation])

  function handleEnroll() {
    enrollment.mutate(trail.id)
  }

  function handleDrop() {
    dropEnrollment.mutate(
      {
        trackId: trail.id,
        enrollmentId: trail.enrollmentId,
      },
      {
        onSuccess: () => setShowDropConfirmation(false),
      },
    )
  }

  function handleDialogBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !dropEnrollment.isPending) {
      setShowDropConfirmation(false)
    }
  }

  return (
    <aside className="trail-detail-sidebar" aria-label="Progresso da trilha">
      <section className="trail-detail-side-card">
        {trail.enrolled ? (
          <ProgressBar label="Seu progresso" value={progress} />
        ) : null}

        {trail.enrolled && firstModuleId ? (
          <ButtonLink
            className="trail-detail-sidebar__cta"
            size="md"
            to={`/trilhas/${trail.id}/modulos/${firstModuleId}`}
            variant="primary"
          >
            Continuar trilha
          </ButtonLink>
        ) : trail.enrolled ? (
          <Button
            className="trail-detail-sidebar__cta"
            disabled
            size="md"
            variant="primary"
          >
            Trilha sem módulos
          </Button>
        ) : canEnroll ? (
          <Button
            className="trail-detail-sidebar__cta"
            loading={enrollment.isPending}
            onClick={handleEnroll}
            size="md"
            variant="primary"
          >
            Inscrever-se
          </Button>
        ) : firstModuleId ? (
          <ButtonLink
            className="trail-detail-sidebar__cta"
            size="md"
            to={`/trilhas/${trail.id}/modulos/${firstModuleId}`}
            variant="outline"
          >
            Ver primeiro módulo
          </ButtonLink>
        ) : (
          <Button
            className="trail-detail-sidebar__cta"
            disabled
            size="md"
            variant="outline"
          >
            Trilha sem módulos
          </Button>
        )}

        {enrollment.isError ? (
          <p className="trail-detail-sidebar__error" role="alert">
            {getTrackRequestErrorMessage(
              enrollment.error,
              'Não foi possível realizar a inscrição nesta trilha.',
            )}
          </p>
        ) : null}

        {canDrop ? (
          <Button
            className="trail-detail-sidebar__drop"
            iconLeft={LogOut}
            onClick={() => {
              dropEnrollment.reset()
              setShowDropConfirmation(true)
            }}
            size="sm"
            variant="ghost"
          >
            Sair da trilha
          </Button>
        ) : null}

        <div className="trail-detail-sidebar__stats">
          <span>
            <strong>Módulos</strong>
            {trail.modules}
          </span>
          <span>
            <strong>Carga</strong>
            {workload}
          </span>
        </div>
      </section>

      {trail.evaluation ? (
        <section className="trail-detail-side-card trail-ai-score-card">
          <div className="trail-ai-score-card__header">
            <span>
              <Star aria-hidden="true" size={14} />
              Última avaliação IA
            </span>
            <StatusBadge size="sm" status="approved">
              {trail.evaluation.status}
            </StatusBadge>
          </div>

          <div className="trail-ai-score-card__score">
            <strong>{trail.evaluation.score}</strong>
            <span>/100</span>
          </div>

          <ProgressBar value={trail.evaluation.score} />

          <div className="trail-ai-score-card__challenge">
            <span>Desafio avaliado</span>
            <strong>{trail.evaluation.challenge}</strong>
            <small>Módulo · {trail.evaluation.module}</small>
          </div>

          <dl className="trail-ai-score-card__metrics">
            <div><dt>{trail.evaluation.attended}</dt><dd>Atendidos</dd></div>
            <div><dt>{trail.evaluation.pending}</dt><dd>Pendentes</dd></div>
            <div><dt>{trail.evaluation.criteria}</dt><dd>Critérios</dd></div>
          </dl>

          <ul className="trail-ai-score-card__checks">
            {trail.evaluation.checks.map((check, index) => (
              <li data-status={check.status} key={`${check.label}-${index}`}>
                <span aria-hidden="true" />
                {check.label}
              </li>
            ))}
          </ul>

          <Button iconRight={ArrowRight} size="md" variant="outline">
            Ver avaliação completa
          </Button>
        </section>
      ) : null}

      <section className="trail-detail-ai-note">
        <Info aria-hidden="true" size={18} strokeWidth={2} />
        <div>
          <strong>Avaliação automática</strong>
          <p>
            Os desafios são validados por IA com base nos critérios definidos
            pelo professor orientador.
          </p>
        </div>
      </section>

      {showDropConfirmation
        ? createPortal(
            <div
              className="trail-drop-modal"
              onMouseDown={handleDialogBackdrop}
              role="presentation"
            >
              <section
                aria-describedby={dialogDescriptionId}
                aria-labelledby={dialogTitleId}
                aria-modal="true"
                className="trail-drop-modal__dialog"
                role="dialog"
              >
                <header className="trail-drop-modal__header">
                  <span className="trail-drop-modal__icon" aria-hidden="true">
                    <AlertTriangle size={22} />
                  </span>
                  <div>
                    <p>Cancelar matrícula</p>
                    <h2 id={dialogTitleId}>Sair desta trilha?</h2>
                  </div>
                  <Button
                    aria-label="Fechar confirmação"
                    disabled={dropEnrollment.isPending}
                    iconLeft={X}
                    onClick={() => setShowDropConfirmation(false)}
                    size="sm"
                    variant="ghost"
                  />
                </header>

                <p
                  id={dialogDescriptionId}
                  className="trail-drop-modal__description"
                >
                  Você deixará de estar matriculado em{' '}
                  <strong>{trail.title}</strong>. Seu progresso será preservado
                  caso decida entrar novamente.
                </p>

                {dropEnrollment.isError ? (
                  <p className="trail-drop-modal__error" role="alert">
                    {getTrackRequestErrorMessage(
                      dropEnrollment.error,
                      'Não foi possível sair da trilha.',
                    )}
                  </p>
                ) : null}

                <footer className="trail-drop-modal__actions">
                  <Button
                    disabled={dropEnrollment.isPending}
                    onClick={() => setShowDropConfirmation(false)}
                    size="md"
                    variant="outline"
                  >
                    Continuar na trilha
                  </Button>
                  <Button
                    iconLeft={LogOut}
                    loading={dropEnrollment.isPending}
                    onClick={handleDrop}
                    size="md"
                    variant="danger"
                  >
                    Sair da trilha
                  </Button>
                </footer>
              </section>
            </div>,
            document.body,
          )
        : null}
    </aside>
  )
}
