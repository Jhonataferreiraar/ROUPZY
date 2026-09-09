import { NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

const allowedProviders = new Set(['google', 'apple'])

export async function GET(request: Request) {
  const url = new URL(request.url)
  const provider = url.searchParams.get('provider') || ''
  const requestedNext = url.searchParams.get('next') || '/app'
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') && !requestedNext.startsWith('/admin') ? requestedNext : '/app'
  if (!allowedProviders.has(provider)) return NextResponse.redirect(new URL('/login?erro=provedor-invalido', url.origin))

  const supabase = await createSupabaseServerClient()
  const callback = new URL('/auth/callback', url.origin)
  callback.searchParams.set('next', next)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as 'google' | 'apple',
    options: { redirectTo: callback.toString(), skipBrowserRedirect: true }
  })
  if (error || !data.url) return NextResponse.redirect(new URL('/login?erro=oauth-indisponivel', url.origin))
  return NextResponse.redirect(data.url)
}
