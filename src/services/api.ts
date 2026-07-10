import axios, { type AxiosError, type AxiosInstance } from 'axios'

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

function getCookieValue(name: string) {
  if (typeof document === 'undefined') {
    return null
  }

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`))

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null
}

function applyApiInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
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

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        authHandlers.onUnauthorized()
      }

      return Promise.reject(error)
    },
  )

  return client
}

export function createApiClient(baseURL: string) {
  return applyApiInterceptors(
    axios.create({
      baseURL,
      xsrfCookieName: 'csrftoken',
      xsrfHeaderName: 'X-CSRFToken',
    }),
  )
}

export const api = createApiClient(import.meta.env.VITE_API_URL)

export default api
