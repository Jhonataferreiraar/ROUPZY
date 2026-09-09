import { getPublicEnv } from '@/lib/config/env'

const publicRoutes = [
  ['', 1],
  ['/como-funciona', 0.8],
  ['/recursos', 0.75],
  ['/sobre', 0.65],
  ['/planos', 0.75],
  ['/faq', 0.65],
  ['/contato', 0.55],
  ['/privacidade', 0.35],
  ['/termos', 0.35],
  ['/cookies', 0.3]
]

export default function sitemap() {
  const baseUrl = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  const lastModified = new Date('2026-09-07T00:00:00.000Z')

  return publicRoutes.map(([route, priority]) => ({
    url: baseUrl + route,
    lastModified,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority
  }))
}
