import axios, { type AxiosError } from 'axios'

interface ApiAuthHandlers {
  getAccessToken: () => string | null
  onUnauthorized: () => void
}

const defaultAuthHandlers: ApiAuthHandlers = {
  getAccessToken: () => null,
  onUnauthorized: () => undefined,
}

let authHandlers = defaultAuthHandlers

export function setApiAuthHandlers(handlers: ApiAuthHandlers) {
  authHandlers = handlers

  return () => {
    if (authHandlers === handlers) {
      authHandlers = defaultAuthHandlers
    }
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
})

function getCookieValue(name: string) {
  if (typeof document === 'undefined') {
    return null
  }

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`))

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null
}

api.interceptors.request.use((config) => {
  const token = authHandlers.getAccessToken()
  const csrfToken = getCookieValue('csrftoken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authHandlers.onUnauthorized()
    }

    return Promise.reject(error)
  },
)

export default api
