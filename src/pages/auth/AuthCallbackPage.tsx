import { useEffect, useRef } from 'react'
import { LoaderCircle } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth, type LoginData } from '../../contexts/AuthContext'
import { exchangeSuapCodeForSession } from '../../services/auth'
import './AuthPages.css'

const CALLBACK_FAILED_URL = '/login?error=callback_failed'
const STUDENT_ROLES = new Set(['student', 'aluno'])
const TEACHER_ROLES = new Set(['teacher', 'professor'])

interface CallbackRequest {
  code: string
  promise: Promise<LoginData>
}

function getRedirectPath(role: string) {
  const normalizedRole = role.trim().toLowerCase()

  if (TEACHER_ROLES.has(normalizedRole)) {
    return '/teacher'
  }

  if (STUDENT_ROLES.has(normalizedRole)) {
    return '/feed'
  }

  throw new Error('Unsupported user role')
}

export default function AuthCallbackPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const callbackRequestRef = useRef<CallbackRequest | null>(null)
  const code = searchParams.get('code')?.trim() ?? ''

  useEffect(() => {
    if (!code) {
      navigate(CALLBACK_FAILED_URL, { replace: true })
      return undefined
    }

    let isActive = true
    const currentRequest =
      callbackRequestRef.current?.code === code
        ? callbackRequestRef.current
        : {
            code,
            promise: exchangeSuapCodeForSession(code),
          }

    callbackRequestRef.current = currentRequest

    currentRequest.promise
      .then((session) => {
        if (!isActive) {
          return
        }

        const redirectPath = getRedirectPath(session.user.role)

        login(session)
        navigate(redirectPath, { replace: true })
      })
      .catch(() => {
        if (!isActive) {
          return
        }

        navigate(CALLBACK_FAILED_URL, { replace: true })
      })

    return () => {
      isActive = false
    }
  }, [code, login, navigate])

  return (
    <main className="auth-page auth-callback-page">
      <section className="auth-callback" aria-labelledby="auth-callback-title">
        <LoaderCircle className="auth-callback__spinner" aria-hidden="true" />
        <div>
          <h1 id="auth-callback-title">Autenticando</h1>
          <p role="status">Validando seu acesso institucional...</p>
        </div>
      </section>
    </main>
  )
}
