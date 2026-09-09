import { NextResponse, type NextRequest } from 'next/server'

import { updateSupabaseSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  try {
    return await updateSupabaseSession(request)
  } catch {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503 })
    }

    const loginPath = request.nextUrl.pathname.startsWith('/admin') ? '/admin/login' : '/login'
    return NextResponse.redirect(new URL(loginPath, request.url))
  }
}

export const config = {
  matcher: ['/app/:path*', '/admin/:path*', '/api/private/:path*']
}
