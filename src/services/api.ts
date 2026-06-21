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
})

api.interceptors.request.use((config) => {
  const token = authHandlers.getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
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
