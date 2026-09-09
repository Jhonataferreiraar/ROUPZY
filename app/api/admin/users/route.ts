import { NextResponse } from 'next/server'
import { z } from 'zod'

import { DomainError } from '@/domain/shared/errors'
import { getAdminUsersData } from '@/lib/admin/users-data'
import { requireAdmin } from '@/lib/auth/server'
import { assertSameOrigin, safeJsonError } from '@/lib/security/request'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const updateSchema = z.object({
  userId: z.string().uuid(),
  blocked: z.boolean().optional(),
  role: z.enum(['support', 'manager', 'owner']).nullable().optional()
}).strict().refine((input) => input.blocked !== undefined || input.role !== undefined, 'Informe uma alteração.')

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const params = new URL(request.url).searchParams
    const search = params.get('search')?.trim().toLowerCase() || ''
    const page = Math.max(1, Math.min(1000, Number.parseInt(params.get('page') || '1', 10) || 1))
    return NextResponse.json(await getAdminUsersData(search, page))
  } catch (error) {
    return safeJsonError(error)
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const { user, role } = await requireAdmin()
    if (role === 'support') throw new DomainError('forbidden', 'Sua função permite apenas leitura.')
    const input = updateSchema.parse(await request.json())
    const admin = createSupabaseAdminClient()

    if (input.role !== undefined) {
      if (role !== 'owner') throw new DomainError('forbidden', 'Somente o proprietário pode gerenciar acessos administrativos.')
      if (input.userId === user.id && input.role !== 'owner') throw new DomainError('validation', 'Você não pode remover o próprio acesso de proprietário.')
      const roleResult = input.role
        ? await admin.from('admin_roles').upsert({ user_id: input.userId, role: input.role, granted_by: user.id, revoked_at: null }, { onConflict: 'user_id' }).select('user_id, role').maybeSingle()
        : await admin.from('admin_roles').update({ revoked_at: new Date().toISOString() }).eq('user_id', input.userId).select('user_id').maybeSingle()
      if (roleResult.error) throw new DomainError('dependency_unavailable', 'Não foi possível atualizar o acesso administrativo.')
      await admin.from('audit_logs').insert({
        actor_id: user.id,
        actor_role: role,
        action: input.role ? 'grant_admin_role' : 'revoke_admin_role',
        resource_type: 'admin_role',
        resource_id: input.userId,
        outcome: 'success',
        metadata: { role: input.role }
      })
      return NextResponse.json({ userId: input.userId, adminRole: input.role })
    }

    if (input.userId === user.id && input.blocked) throw new DomainError('validation', 'Você não pode bloquear o próprio acesso.')
    const { data: updated, error } = await admin.from('profiles').update({ blocked_at: input.blocked ? new Date().toISOString() : null }).eq('id', input.userId).select('id, blocked_at').maybeSingle()
    if (error) throw new DomainError('dependency_unavailable', 'Não foi possível atualizar este acesso.')
    if (!updated) throw new DomainError('not_found', 'Usuário não encontrado.')
    await admin.from('audit_logs').insert({
      actor_id: user.id,
      actor_role: role,
      action: input.blocked ? 'block_user' : 'unblock_user',
      resource_type: 'user',
      resource_id: input.userId,
      outcome: 'success',
      metadata: { blocked: input.blocked }
    })
    return NextResponse.json({ userId: updated.id, blockedAt: updated.blocked_at })
  } catch (error) {
    return safeJsonError(error)
  }
}
