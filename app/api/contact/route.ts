import { NextResponse } from 'next/server'
import { z } from 'zod'

import { assertSameOrigin, safeJsonError } from '@/lib/security/request'
import { consumeRateLimit, rateLimitKey } from '@/lib/security/rate-limit'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  subject: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(3000),
  consent: z.literal(true)
}).strict()

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const input = schema.parse(await request.json())
    const supabase = await createSupabaseServerClient()
    await consumeRateLimit(supabase, rateLimitKey('contact', input.email), 5, 3600)
    const { error } = await supabase.from('contact_requests').insert(input)
    if (error) return NextResponse.json({ error: 'Não foi possível registrar sua mensagem agora.' }, { status: 400 })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    return safeJsonError(error)
  }
}
