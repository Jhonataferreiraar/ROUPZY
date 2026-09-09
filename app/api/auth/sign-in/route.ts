import { NextResponse } from 'next/server'
import { z } from 'zod'

import { assertSameOrigin, safeJsonError } from '@/lib/security/request'
import { consumeRateLimit, rateLimitKey } from '@/lib/security/rate-limit'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200)
}).strict()

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const input = schema.parse(await request.json())
    const supabase = await createSupabaseServerClient()
    await consumeRateLimit(supabase, rateLimitKey('auth:sign-in', input.email), 8, 900)
    const { error } = await supabase.auth.signInWithPassword(input)
    if (error) return NextResponse.json({ error: 'E-mail ou senha inválidos.' }, { status: 401 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return safeJsonError(error)
  }
}
