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
    await consumeRateLimit(supabase, rateLimitKey('auth:admin-sign-in', input.email), 5, 900)
    const { data, error } = await supabase.auth.signInWithPassword(input)
    if (error || !data.user) return NextResponse.json({ error: 'E-mail ou senha inválidos.' }, { status: 401 })

    const { data: role, error: roleError } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .is('revoked_at', null)
      .maybeSingle()

    if (roleError) {
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'Não foi possível validar o acesso administrativo.' }, { status: 503 })
    }
    if (!role) {
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'Esta conta não possui acesso ao painel administrativo.' }, { status: 403 })
    }

    return NextResponse.json({ ok: true, role: role.role })
  } catch (error) {
    return safeJsonError(error)
  }
}
