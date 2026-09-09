import { NextResponse } from 'next/server'
import { z } from 'zod'

import { assertSameOrigin, safeJsonError } from '@/lib/security/request'
import { consumeRateLimit, rateLimitKey } from '@/lib/security/rate-limit'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const schema = z.object({
  displayName: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(200)
}).strict()

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const input = schema.parse(await request.json())
    const supabase = await createSupabaseServerClient()
    await consumeRateLimit(supabase, rateLimitKey('auth:sign-up', input.email), 5, 3600)
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { display_name: input.displayName },
        emailRedirectTo: new URL('/auth/callback?next=/app', request.url).toString()
      }
    })
    if (error) return NextResponse.json({ error: 'Não foi possível criar sua conta. Verifique os dados e tente novamente.' }, { status: 400 })
    return NextResponse.json({ ok: true, needsEmailConfirmation: !data.session })
  } catch (error) {
    return safeJsonError(error)
  }
}
