import { NextResponse } from 'next/server'
import { z } from 'zod'

import { assertSameOrigin, safeJsonError } from '@/lib/security/request'
import { consumeRateLimit, rateLimitKey } from '@/lib/security/rate-limit'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const schema = z.object({ email: z.string().trim().email() }).strict()

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const input = schema.parse(await request.json())
    const supabase = await createSupabaseServerClient()
    await consumeRateLimit(supabase, rateLimitKey('auth:forgot-password', input.email), 5, 3600)
    const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
      redirectTo: new URL('/auth/callback?next=/redefinir-senha', request.url).toString()
    })
    if (error) return NextResponse.json({ error: 'Não foi possível enviar o link agora.' }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return safeJsonError(error)
  }
}
