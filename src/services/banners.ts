import { createApiClient } from './api'
import type { Banner, BannerType, FeedHeroSlide } from '../types/feed'

/** Camada de integração com os banners do feed-service. */

const feedApi = createApiClient(
  import.meta.env.VITE_FEED_API_URL ?? import.meta.env.VITE_API_URL,
)

interface ApiBanner {
  id: string
  type: BannerType
  title: string
  subtitle: string
  primary_button_text: string
  primary_button_link: string
  secondary_button_text: string
  secondary_button_link: string
  is_active: boolean
  order: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface BannerInput {
  type: BannerType
  title: string
  subtitle: string
  primaryButtonText: string
  primaryButtonLink: string
  secondaryButtonText: string
  secondaryButtonLink: string
  isActive: boolean
}

function mapBanner(banner: ApiBanner): Banner {
  return {
    id: banner.id,
    type: banner.type,
    title: banner.title,
    subtitle: banner.subtitle,
    primaryButtonText: banner.primary_button_text,
    primaryButtonLink: banner.primary_button_link,
    secondaryButtonText: banner.secondary_button_text,
    secondaryButtonLink: banner.secondary_button_link,
    isActive: banner.is_active,
    order: banner.order,
  }
}

function toApiPayload(input: Partial<BannerInput>) {
  return {
    type: input.type,
    title: input.title,
    subtitle: input.subtitle,
    primary_button_text: input.primaryButtonText,
    primary_button_link: input.primaryButtonLink,
    secondary_button_text: input.secondaryButtonText,
    secondary_button_link: input.secondaryButtonLink,
    is_active: input.isActive,
  }
}

const BANNER_THEME: Record<BannerType, FeedHeroSlide['theme']> = {
  COMUNICADO_IFRN: 'green',
  SISTEMA: 'blue',
}

/** Converte um banner dinâmico no formato de slide que `FeedHero` já renderiza. */
export function bannerToSlide(banner: Banner): FeedHeroSlide {
  const actions: FeedHeroSlide['actions'] = []
  if (banner.primaryButtonText && banner.primaryButtonLink) {
    actions.push({ label: banner.primaryButtonText, href: banner.primaryButtonLink, variant: 'primary' })
  }
  if (banner.secondaryButtonText && banner.secondaryButtonLink) {
    actions.push({ label: banner.secondaryButtonText, href: banner.secondaryButtonLink, variant: 'soft' })
  }

  return {
    id: banner.id,
    theme: BANNER_THEME[banner.type],
    eyebrow: banner.type === 'COMUNICADO_IFRN' ? 'Comunicado IFRN' : 'ATLAS Sistema',
    title: banner.title,
    titleAccent: '',
    description: banner.subtitle,
    actions,
  }
}

export async function getBanners(all = false): Promise<Banner[]> {
  const { data } = await feedApi.get<ApiBanner[]>('feed/banners/', {
    params: all ? { all: 'true' } : undefined,
  })
  return data.map(mapBanner)
}

export async function createBanner(input: BannerInput): Promise<Banner> {
  const { data } = await feedApi.post<ApiBanner>('feed/banners/', toApiPayload(input))
  return mapBanner(data)
}

export async function updateBanner(
  bannerId: string,
  patch: Partial<BannerInput>,
): Promise<Banner> {
  const { data } = await feedApi.patch<ApiBanner>(`feed/banners/${bannerId}/`, toApiPayload(patch))
  return mapBanner(data)
}

export async function deleteBanner(bannerId: string): Promise<void> {
  await feedApi.delete(`feed/banners/${bannerId}/`)
}

export async function setBannerOrder(bannerId: string, order: number): Promise<Banner> {
  const { data } = await feedApi.patch<ApiBanner>(`feed/banners/${bannerId}/`, { order })
  return mapBanner(data)
}
