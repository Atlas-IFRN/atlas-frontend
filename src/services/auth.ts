import api from './api'

interface SuapLoginResponse {
  login_url: string
}

export async function getSuapLoginUrl(): Promise<string> {
  const { data } = await api.get<SuapLoginResponse>('auth/suap/login/')

  return data.login_url
}
