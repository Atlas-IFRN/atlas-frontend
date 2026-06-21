import axios from 'axios'

interface ApiAuthHandlers {
  getAccessToken: () => string | null
}

const defaultAuthHandlers: ApiAuthHandlers = {
  getAccessToken: () => null,
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
  // Em produção, use a origem pública do Nginx; nunca um microsserviço.
  baseURL: import.meta.env.VITE_API_URL || window.location.origin,
})

api.interceptors.request.use((config) => {
  const token = authHandlers.getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
