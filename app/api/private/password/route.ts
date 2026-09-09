import { NextResponse } from 'next/server'
import { z } from 'zod'

import { DomainError } from '@/domain/shared/errors'
import { getAuthContext } from '@/lib/auth/server'
import { assertSameOrigin, safeJsonError } from '@/lib/security/request'
import { consumeRateLimit, rateLimitKey } from '@/lib/security/rate-limit'

const schema = z.object({ password: z.string().min(8).max(200) }).strict()

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const { supabase, user } = await getAuthContext()
    const input = schema.parse(await request.json())
    await consumeRateLimit(supabase, rateLimitKey('auth:password-update', user.id), 5, 900)
    const { error } = await supabase.auth.updateUser({ password: input.password })
    if (error) throw new DomainError('dependency_unavailable', 'Não foi possível atualizar sua senha agora.')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return safeJsonError(error)
  }
}
