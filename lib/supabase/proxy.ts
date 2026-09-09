import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

import { getSupabaseEnv } from '@/lib/config/env'

const protectedPrefixes = ['/app', '/admin', '/api/private']

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function isAdminPath(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

export async function updateSupabaseSession(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next({ request })
  }

  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next({ request })
  }

  const forwardedHeaders = new Headers(request.headers)
  forwardedHeaders.delete('x-roupzy-auth-user')
  forwardedHeaders.delete('x-roupzy-auth-email')
  forwardedHeaders.delete('x-roupzy-auth-created-at')

  const refreshedCookies: Array<{ name: string; value: string; options: CookieOptions }> = []
  let response = NextResponse.next({ request: { headers: forwardedHeaders } })
  const { url, anonKey } = getSupabaseEnv()
  const secure = process.env.NODE_ENV === 'production'

  const refreshResponse = () => {
    response = NextResponse.next({ request: { headers: forwardedHeaders } })
    refreshedCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, {
        ...options,
        httpOnly: true,
        secure,
        sameSite: options?.sameSite ?? 'lax'
      })
    })
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          refreshedCookies.push({ name, value, options })
        })
        refreshResponse()
      }
    }
  })

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    forwardedHeaders.set('x-roupzy-auth-user', user.id)
    if (user.email) forwardedHeaders.set('x-roupzy-auth-email', user.email)
    if (user.created_at) forwardedHeaders.set('x-roupzy-auth-created-at', user.created_at)
    refreshResponse()
  }

  if (!user && !request.nextUrl.pathname.startsWith('/api/')) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = isAdminPath(request.nextUrl.pathname) ? '/admin/login' : '/login'
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}
