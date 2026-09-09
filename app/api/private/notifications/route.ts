import { NextResponse } from 'next/server'
import { z } from 'zod'

import { DomainError } from '@/domain/shared/errors'
import { getAuthContext } from '@/lib/auth/server'
import { assertSameOrigin, safeJsonError } from '@/lib/security/request'

const updateSchema = z.object({
  id: z.string().uuid().optional(),
  markAllRead: z.boolean().optional()
}).strict().refine((input) => Boolean(input.id) !== Boolean(input.markAllRead), 'Informe uma notificação ou marque todas como lidas.')

export async function GET() {
  try {
    const { supabase, user } = await getAuthContext()
    const { data, error } = await supabase.from('notifications').select('id, kind, title, body, metadata, read_at, created_at').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(50)
    if (error) throw new DomainError('dependency_unavailable', 'Não foi possível carregar suas notificações.')
    return NextResponse.json({ notifications: data || [] })
  } catch (error) {
    return safeJsonError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request)
    const { supabase, user } = await getAuthContext()
    const input = updateSchema.parse(await request.json())
    let query = supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('owner_id', user.id).is('read_at', null)
    if (input.id) query = query.eq('id', input.id)
    const { error } = await query
    if (error) throw new DomainError('dependency_unavailable', 'Não foi possível atualizar suas notificações.')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return safeJsonError(error)
  }
}
