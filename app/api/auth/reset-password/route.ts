import { NextResponse } from 'next/server'
import { z } from 'zod'

import { assertSameOrigin, safeJsonError } from '@/lib/security/request'
import { consumeRateLimit, rateLimitKey } from '@/lib/security/rate-limit'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const schema = z.object({ password: z.string().min(8).max(200) }).strict()

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const input = schema.parse(await request.json())
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) return NextResponse.json({ error: 'O link de recuperação expirou. Solicite outro.' }, { status: 401 })
    await consumeRateLimit(supabase, rateLimitKey('auth:reset-password', data.user.id), 5, 3600)
    const { error } = await supabase.auth.updateUser({ password: input.password })
    if (error) return NextResponse.json({ error: 'Não foi possível atualizar a senha.' }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return safeJsonError(error)
  }
}
