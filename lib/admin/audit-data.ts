import 'server-only'

import { DomainError } from '@/domain/shared/errors'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function getAdminAuditData({ limit = 100, outcome, resourceType }: { limit?: number; outcome?: string; resourceType?: string } = {}) {
  const admin = createSupabaseAdminClient()
  let query = admin.from('audit_logs').select('id, actor_id, actor_role, action, resource_type, resource_id, outcome, request_id, metadata, created_at').order('created_at', { ascending: false }).limit(limit)
  if (outcome) query = query.eq('outcome', outcome)
  if (resourceType) query = query.eq('resource_type', resourceType)
  const { data, error } = await query
  if (error) throw new DomainError('dependency_unavailable', 'Não foi possível carregar a auditoria.')
  return { logs: data || [] }
}
