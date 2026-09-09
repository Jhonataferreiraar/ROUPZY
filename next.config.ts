import type { NextConfig } from 'next'

const isDevelopment = process.env.NODE_ENV !== 'production'
const scriptSource = isDevelopment ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'"
const transportSecurityHeaders = isDevelopment
  ? []
  : [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]

const securityHeaders = [
  { key: 'Content-Security-Policy', value: `default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in; font-src 'self'; connect-src 'self' https://*.supabase.co https://*.supabase.in; script-src ${scriptSource}; style-src 'self' 'unsafe-inline'` },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  ...transportSecurityHeaders
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30
  },
  async headers() {
    return [
      {
        source: '/api/private/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }]
      },
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ]
  }
}

export default nextConfig
