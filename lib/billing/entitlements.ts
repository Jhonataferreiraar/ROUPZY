import 'server-only'

import { DomainError } from '@/domain/shared/errors'
import { planLimitDefaults } from '@/lib/config/limits'

export type SupabaseLike = {
  from: (table: string) => any
  rpc: (name: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }>
}

export type EffectivePlanLimits = {
  maxClosetItems: number
  maxLookGenerationsPerMonth: number
  maxAiAnalysesPerMonth: number
  maxInspirationAnalysesPerMonth: number
}

const freeDefaults: EffectivePlanLimits = {
  ...planLimitDefaults.free,
  maxInspirationAnalysesPerMonth: 3
}

export async function getEffectivePlanLimits(supabase: SupabaseLike, userId: string): Promise<EffectivePlanLimits> {
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('plans(limits)')
    .eq('owner_id', userId)
    .in('status', ['trialing', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subscriptionError) throw new DomainError('dependency_unavailable', 'Não foi possível carregar os limites do seu plano.')
  const plan = Array.isArray(subscription?.plans) ? subscription.plans[0] : subscription?.plans
  const planLimits = plan?.limits && typeof plan.limits === 'object' ? plan.limits : {}
  const limits = { ...freeDefaults }
  for (const key of Object.keys(limits) as Array<keyof EffectivePlanLimits>) {
    const value = planLimits[key]
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0) limits[key] = value
  }
  return limits
}

export async function reservePlanQuota(supabase: SupabaseLike, userId: string, metric: keyof EffectivePlanLimits, limit: number) {
  const metricName = metric.replace(/^max/, '').replace(/([A-Z])/g, (letter) => '_' + letter.toLowerCase()).replace(/^_/, '')
  const { data, error } = await supabase.rpc('reserve_usage_counter', {
    p_owner_id: userId,
    p_metric: metricName,
    p_limit: limit
  })
  if (error) throw new DomainError('dependency_unavailable', 'Não foi possível validar o limite do seu plano.')
  if (data !== true) throw new DomainError('rate_limited', 'Você atingiu o limite do seu plano neste período.')
  return metricName
}

export async function commitPlanQuota(supabase: SupabaseLike, userId: string, metricName: string) {
  await supabase.rpc('commit_usage_counter', { p_owner_id: userId, p_metric: metricName })
}

export async function releasePlanQuota(supabase: SupabaseLike, userId: string, metricName: string) {
  await supabase.rpc('release_usage_counter', { p_owner_id: userId, p_metric: metricName })
}
