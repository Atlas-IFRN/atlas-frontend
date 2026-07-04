import { useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'
import { Button } from '../../components/atoms/Button'
import { useAuth } from '../../contexts/AuthContext'
import { getSuapLoginUrl } from '../../services/auth'
import atlasLogo from '../../assets/brand/atlas-logo-full-white.svg'
import './AuthPages.css'

const suapErrorMessages: Record<string, string> = {
  callback_failed:
    'Não foi possível concluir o retorno do SUAP. Tente entrar novamente.',
  access_denied:
    'Acesso negado no SUAP. Tente novamente usando sua conta institucional.',
  server_error:
    'O SUAP encontrou uma instabilidade durante o login. Tente novamente em instantes.',
  temporarily_unavailable:
    'O login institucional está temporariamente indisponível. Tente novamente em instantes.',
}

function getSuapErrorMessage(error: string | null) {
  if (!error) {
    return null
  }

  return (
    suapErrorMessages[error] ??
    `Não foi possível concluir o login pelo SUAP (${error}). Tente novamente.`
  )
}

export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const suapError = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return getSuapErrorMessage(params.get('error'))
  }, [location.search])

  const visibleError = requestError ?? suapError

  async function handleSuapLogin() {
    setIsLoading(true)
    setRequestError(null)

    try {
      const loginUrl = await getSuapLoginUrl()

      if (!loginUrl) {
        throw new Error('SUAP login URL was not returned')
      }

      window.location.assign(loginUrl)
    } catch {
      setRequestError(
        'Não foi possível iniciar o login com o SUAP. Verifique sua conexão e tente novamente.',
      )
      setIsLoading(false)
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/inicio" replace />
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-card__brand-panel">
          <div className="auth-card__brand">
            <span className="auth-card__logo" aria-hidden="true">
              <img src={atlasLogo} alt="" />
            </span>
          </div>

          <div className="auth-card__intro">
            <h1>Sua jornada de desenvolvimento começa aqui.</h1>
            <p>
              Trilhas de aprendizado, bolsas de pesquisa e projetos do IFRN em
              uma só plataforma.
            </p>
          </div>

          <ul className="auth-card__benefits" aria-label="Recursos do ATLAS">
            <li>
              <BookOpen size={18} aria-hidden="true" />
              <span>Trilhas guiadas por especialistas</span>
            </li>
            <li>
              <BriefcaseBusiness size={18} aria-hidden="true" />
              <span>Bolsas de P&amp;D e iniciação científica</span>
            </li>
            <li>
              <Award size={18} aria-hidden="true" />
              <span>Certificados reconhecidos</span>
            </li>
          </ul>
        </div>

        <div className="auth-card__form-panel">
          <div className="auth-card__eyebrow">
            <span aria-hidden="true" />
            <p>Acesso institucional</p>
          </div>

          <div className="auth-card__heading">
            <h2 id="login-title">Entrar no ATLAS</h2>
            <p>Use sua conta institucional do IFRN para acessar a plataforma.</p>
          </div>

          {visibleError ? (
            <div className="auth-card__error" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <p>{visibleError}</p>
            </div>
          ) : null}

          <Button
            className="auth-card__suap-button"
            iconLeft={LockKeyhole}
            iconRight={ArrowRight}
            loading={isLoading}
            onClick={handleSuapLogin}
            size="lg"
          >
            <span className="auth-card__suap-label">
              <strong>{isLoading ? 'Redirecionando...' : 'Entrar com SUAP'}</strong>
              <small>Sistema Unificado de Administração Pública</small>
            </span>
          </Button>

          <div className="auth-card__divider">
            <span />
            <p>autenticação segura</p>
            <span />
          </div>

          <aside className="auth-card__notice">
            <ShieldCheck size={18} aria-hidden="true" />
            <p>
              O ATLAS utiliza <strong>exclusivamente o SUAP</strong> para
              autenticação. Você será redirecionado ao portal institucional e
              retornará automaticamente após o login. Não armazenamos sua senha.
            </p>
          </aside>

          <p className="auth-card__support">
            Problemas para acessar? <a href="mailto:suporte@ifrn.edu.br">Fale com o suporte</a>
          </p>
        </div>
      </section>
    </main>
  )
}
