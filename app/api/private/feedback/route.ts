import { NextResponse } from 'next/server'
import { z } from 'zod'

import { DomainError } from '@/domain/shared/errors'
import { getAuthContext } from '@/lib/auth/server'
import { assertSameOrigin, safeJsonError } from '@/lib/security/request'
import { consumeRateLimit, rateLimitKey } from '@/lib/security/rate-limit'

const schema = z.object({
  category: z.enum(['product', 'look', 'bug', 'other']),
  body: z.string().trim().min(1).max(2000)
}).strict()

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const { supabase, user } = await getAuthContext()
    await consumeRateLimit(supabase, rateLimitKey('feedback:write', user.id), 10, 3600)
    const input = schema.parse(await request.json())
    const { error } = await supabase.from('feedback').insert({
      owner_id: user.id,
      category: input.category,
      body: input.body,
      context: { source: 'settings' }
    })
    if (error) throw new DomainError('dependency_unavailable', 'Não foi possível registrar seu feedback agora.')
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    return safeJsonError(error)
  }
}
