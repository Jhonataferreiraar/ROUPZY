import 'server-only'

import { DomainError } from '@/domain/shared/errors'
import { getServerEnv } from '@/lib/config/env'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function getBillingOverview() {
  const admin = createSupabaseAdminClient()
  const [subscriptions, events, plans] = await Promise.all([
    admin.from('subscriptions').select('id, owner_id, provider, status, current_period_end, created_at, plans(name)').order('created_at', { ascending: false }).limit(100),
    admin.from('billing_events').select('id, event_type, amount_minor, currency, status, created_at').order('created_at', { ascending: false }).limit(50),
    admin.from('plans').select('id, name, active').order('display_order', { ascending: true })
  ])
  if (subscriptions.error || events.error || plans.error) throw new DomainError('dependency_unavailable', 'Não foi possível carregar a operação financeira.')
  return { subscriptions: subscriptions.data || [], events: events.data || [], plans: plans.data || [] }
}

export async function getAiOverview() {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.from('ai_usage').select('id, provider, model, operation, status, input_tokens, output_tokens, estimated_cost_minor, duration_ms, created_at').order('created_at', { ascending: false }).limit(100)
  if (error) throw new DomainError('dependency_unavailable', 'Não foi possível carregar a operação de inteligência artificial.')
  return data || []
}

export async function getIntegrationOverview() {
  const env = getServerEnv()
  const admin = createSupabaseAdminClient()
  const { data: buckets, error } = await admin.storage.listBuckets()
  if (error) throw new DomainError('dependency_unavailable', 'Não foi possível verificar as integrações.')
  return {
    database: true,
    storage: (buckets || []).some((bucket) => bucket.id === 'clothing-images' && bucket.public === false),
    ai: Boolean(env.GEMINI_API_KEY),
    billing: Boolean(env.BILLING_PROVIDER && env.BILLING_WEBHOOK_SECRET)
  }
}
