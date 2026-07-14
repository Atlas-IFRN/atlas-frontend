import { useEffect, useId, useState, type FormEvent, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { ArrowDown, ArrowUp, Check, Layers, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '../../atoms/Button'
import {
  useBanners,
  useCreateBanner,
  useDeleteBanner,
  usePublishBanners,
  useReorderBanner,
  useUpdateBanner,
} from '../../../hooks/useBanners'
import { getFeedRequestErrorMessage } from '../../../services/feed'
import { isValidOptionalUrl } from '../../../utils/url'
import type { Banner, BannerType } from '../../../types/feed'
import type { BannerInput } from '../../../services/banners'

interface BannerManageModalProps {
  onClose: () => void
}

const TYPE_LABELS: Record<BannerType, string> = {
  COMUNICADO_IFRN: 'Comunicado IFRN',
  SISTEMA: 'Sistema',
}

const EMPTY_FORM: BannerInput = {
  type: 'COMUNICADO_IFRN',
  title: '',
  subtitle: '',
  primaryButtonText: '',
  primaryButtonLink: '',
  secondaryButtonText: '',
  secondaryButtonLink: '',
  isActive: true,
}

function bannerToForm(banner: Banner): BannerInput {
  return {
    type: banner.type,
    title: banner.title,
    subtitle: banner.subtitle,
    primaryButtonText: banner.primaryButtonText,
    primaryButtonLink: banner.primaryButtonLink,
    secondaryButtonText: banner.secondaryButtonText,
    secondaryButtonLink: banner.secondaryButtonLink,
    isActive: banner.isActive,
  }
}

export function BannerManageModal({ onClose }: BannerManageModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const [mode, setMode] = useState<'list' | 'form'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<BannerInput>(EMPTY_FORM)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // Fica true assim que o docente faz qualquer alteração persistida no modal.
  // O carrossel público só é atualizado quando ele clica em "Salvar alterações".
  const [dirty, setDirty] = useState(false)

  const { data: banners = [], isLoading, isError } = useBanners(true)
  const createBanner = useCreateBanner()
  const updateBanner = useUpdateBanner()
  const deleteBanner = useDeleteBanner()
  const reorderBanner = useReorderBanner()
  const publishBanners = usePublishBanners()

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, busy])

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !busy) {
      onClose()
    }
  }

  function updateField<K extends keyof BannerInput>(field: K, value: BannerInput[K]) {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  function openCreateForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
    setMode('form')
  }

  function openEditForm(banner: Banner) {
    setEditingId(banner.id)
    setForm(bannerToForm(banner))
    setError('')
    setMode('form')
  }

  async function handleDelete(banner: Banner) {
    if (!window.confirm(`Excluir o banner "${banner.title}"?`)) {
      return
    }
    setBusy(true)
    try {
      await deleteBanner.mutateAsync(banner.id)
      setDirty(true)
    } catch (err) {
      setError(getFeedRequestErrorMessage(err, 'Não foi possível excluir o banner.'))
    } finally {
      setBusy(false)
    }
  }

  async function handleToggleActive(banner: Banner) {
    setBusy(true)
    try {
      await updateBanner.mutateAsync({ id: banner.id, patch: { isActive: !banner.isActive } })
      setDirty(true)
    } catch (err) {
      setError(getFeedRequestErrorMessage(err, 'Não foi possível atualizar o banner.'))
    } finally {
      setBusy(false)
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= banners.length) {
      return
    }
    const current = banners[index]
    const target = banners[targetIndex]
    setBusy(true)
    try {
      await Promise.all([
        reorderBanner.mutateAsync({ id: current.id, order: target.order }),
        reorderBanner.mutateAsync({ id: target.id, order: current.order }),
      ])
      setDirty(true)
    } catch (err) {
      setError(getFeedRequestErrorMessage(err, 'Não foi possível reordenar os banners.'))
    } finally {
      setBusy(false)
    }
  }

  /** "Salvar alterações": publica o que foi editado no carrossel e fecha o modal. */
  async function handleSaveAndClose() {
    if (dirty) {
      await publishBanners()
    }
    onClose()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('Informe um título para o banner.')
      return
    }
    if (!isValidOptionalUrl(form.primaryButtonLink) || !isValidOptionalUrl(form.secondaryButtonLink)) {
      setError('Informe links completos começando com http:// ou https://.')
      return
    }

    setBusy(true)
    setError('')

    try {
      if (editingId) {
        await updateBanner.mutateAsync({ id: editingId, patch: form })
      } else {
        await createBanner.mutateAsync(form)
      }
      setDirty(true)
      setMode('list')
    } catch (err) {
      setError(getFeedRequestErrorMessage(err, 'Não foi possível salvar o banner.'))
    } finally {
      setBusy(false)
    }
  }

  return createPortal(
    <div
      className="banner-manage-modal"
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="banner-manage-modal__dialog"
        role="dialog"
      >
        <header className="banner-manage-modal__header">
          <div className="banner-manage-modal__heading-icon" aria-hidden="true">
            <Layers size={22} />
          </div>
          <div>
            <p className="banner-manage-modal__eyebrow">Feed</p>
            <h2 id={titleId}>
              {mode === 'list' ? 'Gerenciar banners' : editingId ? 'Editar banner' : 'Novo banner'}
            </h2>
            <p id={descriptionId}>
              Comunicados e avisos exibidos no carrossel do feed.
            </p>
          </div>
          <Button
            aria-label="Fechar"
            className="banner-manage-modal__close"
            disabled={busy}
            iconLeft={X}
            onClick={onClose}
            size="sm"
            variant="ghost"
          />
        </header>

        {error ? (
          <p className="banner-manage-modal__error" role="alert">{error}</p>
        ) : null}

        {mode === 'list' ? (
          <div className="banner-manage-list">
            {isLoading ? (
              <p className="banner-manage-list__empty">Carregando banners…</p>
            ) : isError ? (
              <p className="banner-manage-list__empty">Não foi possível carregar os banners.</p>
            ) : banners.length === 0 ? (
              <p className="banner-manage-list__empty">Nenhum banner cadastrado ainda.</p>
            ) : (
              <ul className="banner-manage-list__items">
                {banners.map((banner, index) => (
                  <li className="banner-manage-list__item" key={banner.id}>
                    <div className="banner-manage-list__reorder">
                      <Button
                        aria-label="Mover para cima"
                        disabled={busy || index === 0}
                        iconLeft={ArrowUp}
                        onClick={() => void handleMove(index, -1)}
                        size="sm"
                        variant="ghost"
                      />
                      <Button
                        aria-label="Mover para baixo"
                        disabled={busy || index === banners.length - 1}
                        iconLeft={ArrowDown}
                        onClick={() => void handleMove(index, 1)}
                        size="sm"
                        variant="ghost"
                      />
                    </div>

                    <div className="banner-manage-list__info">
                      <span className="banner-manage-list__type">{TYPE_LABELS[banner.type]}</span>
                      <strong>{banner.title}</strong>
                      {banner.subtitle ? <span>{banner.subtitle}</span> : null}
                    </div>

                    <label className="banner-manage-list__active">
                      <input
                        checked={banner.isActive}
                        disabled={busy}
                        onChange={() => void handleToggleActive(banner)}
                        type="checkbox"
                      />
                      Ativo
                    </label>

                    <div className="banner-manage-list__actions">
                      <Button
                        aria-label="Editar banner"
                        iconLeft={Pencil}
                        onClick={() => openEditForm(banner)}
                        size="sm"
                        variant="outline"
                      />
                      <Button
                        aria-label="Excluir banner"
                        disabled={busy}
                        iconLeft={Trash2}
                        onClick={() => void handleDelete(banner)}
                        size="sm"
                        variant="danger"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <footer className="banner-manage-modal__footer">
              <Button iconLeft={Plus} onClick={openCreateForm} type="button" variant="outline">
                Novo banner
              </Button>
              <div className="banner-manage-modal__footer-actions">
                {dirty ? (
                  <span className="banner-manage-modal__footer-hint">
                    Alterações salvas — publique no carrossel.
                  </span>
                ) : null}
                <Button
                  disabled={busy}
                  iconLeft={Check}
                  onClick={() => void handleSaveAndClose()}
                  type="button"
                >
                  Salvar alterações
                </Button>
              </div>
            </footer>
          </div>
        ) : (
          <form className="banner-manage-form" onSubmit={handleSubmit}>
            <label className="banner-manage-field">
              <span className="banner-manage-field__label">Tipo</span>
              <select
                onChange={(event) => updateField('type', event.target.value as BannerType)}
                value={form.type}
              >
                <option value="COMUNICADO_IFRN">Comunicado IFRN</option>
                <option value="SISTEMA">Sistema</option>
              </select>
            </label>

            <label className="banner-manage-field">
              <span className="banner-manage-field__label">Título</span>
              <input
                maxLength={200}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Ex.: VII ETAL 2026"
                value={form.title}
              />
            </label>

            <label className="banner-manage-field">
              <span className="banner-manage-field__label">Subtítulo</span>
              <textarea
                maxLength={300}
                onChange={(event) => updateField('subtitle', event.target.value)}
                placeholder="Texto de apoio exibido abaixo do título."
                rows={3}
                value={form.subtitle}
              />
            </label>

            <div className="banner-manage-form__row">
              <label className="banner-manage-field">
                <span className="banner-manage-field__label">Botão primário — texto</span>
                <input
                  maxLength={60}
                  onChange={(event) => updateField('primaryButtonText', event.target.value)}
                  value={form.primaryButtonText}
                />
              </label>
              <label className="banner-manage-field">
                <span className="banner-manage-field__label">Botão primário — link</span>
                <input
                  inputMode="url"
                  maxLength={300}
                  onChange={(event) => updateField('primaryButtonLink', event.target.value)}
                  placeholder="https://..."
                  value={form.primaryButtonLink}
                />
              </label>
            </div>

            <div className="banner-manage-form__row">
              <label className="banner-manage-field">
                <span className="banner-manage-field__label">Botão secundário — texto</span>
                <input
                  maxLength={60}
                  onChange={(event) => updateField('secondaryButtonText', event.target.value)}
                  value={form.secondaryButtonText}
                />
              </label>
              <label className="banner-manage-field">
                <span className="banner-manage-field__label">Botão secundário — link</span>
                <input
                  inputMode="url"
                  maxLength={300}
                  onChange={(event) => updateField('secondaryButtonLink', event.target.value)}
                  placeholder="https://..."
                  value={form.secondaryButtonLink}
                />
              </label>
            </div>

            <label className="banner-manage-field banner-manage-field--checkbox">
              <input
                checked={form.isActive}
                onChange={(event) => updateField('isActive', event.target.checked)}
                type="checkbox"
              />
              Banner ativo (visível no carrossel)
            </label>

            <footer className="banner-manage-form__actions">
              <Button disabled={busy} onClick={() => setMode('list')} type="button" variant="outline">
                Voltar
              </Button>
              <Button loading={busy} type="submit">
                Salvar banner
              </Button>
            </footer>
          </form>
        )}
      </section>
    </div>,
    document.body,
  )
}
