/**
 * Prefixos públicos expostos pelo API Gateway.
 *
 * As rotas internas e os endereços dos microsserviços não devem ser usados
 * pelo frontend. O Nginx valida o token e encaminha cada requisição.
 */
export const GATEWAY_ROUTES = {
  auth: '/api/auth/',
  tracks: '/api/tracks/',
  scholarships: '/api/bolsas/',
  ai: '/api/ia/',
} as const

export type GatewayService = keyof typeof GATEWAY_ROUTES

export function gatewayRoute(service: GatewayService, path = '') {
  return `${GATEWAY_ROUTES[service]}${path.replace(/^\/+/, '')}`
}
