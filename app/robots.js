import { getPublicEnv } from '@/lib/config/env'

export default function robots() {
  const baseUrl = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, '')

  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: ['/app', '/admin', '/api', '/auth']
    }],
    sitemap: baseUrl + '/sitemap.xml'
  }
}
