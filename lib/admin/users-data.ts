import 'server-only'

import { DomainError } from '@/domain/shared/errors'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function getAdminUsersData(search = '', page = 1) {
  const perPage = 50
  const rangeStart = (page - 1) * perPage
  const admin = createSupabaseAdminClient()
  const authUsers = []
  let hasMore = false

  if (search) {
    for (let authPage = 1; authPage <= 100; authPage += 1) {
      const { data, error } = await admin.auth.admin.listUsers({ page: authPage, perPage })
      if (error) throw new DomainError('dependency_unavailable', 'Não foi possível carregar os usuários.')
      authUsers.push(...(data?.users || []))
      if ((data?.users || []).length < perPage) break
    }
  } else {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw new DomainError('dependency_unavailable', 'Não foi possível carregar os usuários.')
    authUsers.push(...(data?.users || []))
    hasMore = authUsers.length === perPage
  }

  const profileQuery = admin.from('profiles').select('id, display_name, onboarding_status, blocked_at, created_at').order('created_at', { ascending: false })
  const profilesRequest = search && authUsers.length
    ? profileQuery.in('id', authUsers.map((authUser) => authUser.id))
    : search
      ? Promise.resolve({ data: [], error: null })
      : profileQuery.range(rangeStart, rangeStart + perPage - 1)
  const [{ data: profiles, error: profileError }, { data: roles, error: rolesError }] = await Promise.all([
    profilesRequest,
    admin.from('admin_roles').select('user_id, role, revoked_at')
  ])
  if (profileError || rolesError) throw new DomainError('dependency_unavailable', 'Não foi possível carregar os usuários.')

  const userIds = authUsers.map((authUser) => authUser.id)
  const periodStart = new Date()
  periodStart.setUTCDate(1)
  const periodKey = periodStart.toISOString().slice(0, 10)
  const [{ data: subscriptions, error: subscriptionsError }, { data: usageCounters, error: usageError }] = userIds.length
    ? await Promise.all([
        admin.from('subscriptions').select('owner_id, status, current_period_end, created_at, plans(code, name)').in('owner_id', userIds).in('status', ['trialing', 'active', 'past_due', 'paused']).order('created_at', { ascending: false }),
        admin.from('usage_counters').select('owner_id, metric, consumed, reserved, limit_value, period_start').in('owner_id', userIds).eq('period_start', periodKey)
      ])
    : [{ data: [], error: null }, { data: [], error: null }]
  if (subscriptionsError || usageError) throw new DomainError('dependency_unavailable', 'Não foi possível carregar os planos e usos dos usuários.')

  const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]))
  const roleById = new Map((roles || []).map((adminRole) => [adminRole.user_id, adminRole]))
  const subscriptionByUserId = new Map()
  for (const subscription of subscriptions || []) {
    if (!subscriptionByUserId.has(subscription.owner_id)) subscriptionByUserId.set(subscription.owner_id, subscription)
  }
  const usageByUserId = new Map()
  for (const counter of usageCounters || []) {
    if (!usageByUserId.has(counter.owner_id)) usageByUserId.set(counter.owner_id, new Map())
    usageByUserId.get(counter.owner_id).set(counter.metric, counter)
  }
  const filteredUsers = authUsers
    .map((authUser) => {
      const profile = profileById.get(authUser.id)
      const subscription = subscriptionByUserId.get(authUser.id)
      const plan = Array.isArray(subscription?.plans) ? subscription.plans[0] : subscription?.plans
      const counters = usageByUserId.get(authUser.id) || new Map()
      const counter = (metric: string) => {
        const value = counters.get(metric)
        return value ? { consumed: value.consumed || 0, reserved: value.reserved || 0, limit: value.limit_value || 0 } : { consumed: 0, reserved: 0, limit: null }
      }
      return {
        id: authUser.id,
        email: authUser.email || '',
        displayName: profile?.display_name || authUser.user_metadata?.display_name || 'Sem nome',
        onboardingStatus: profile?.onboarding_status || 'not_started',
        blockedAt: profile?.blocked_at || null,
        adminRole: roleById.get(authUser.id)?.revoked_at ? null : roleById.get(authUser.id)?.role || null,
        createdAt: profile?.created_at || authUser.created_at,
        plan: plan ? { code: plan.code, name: plan.name, status: subscription.status, periodEnd: subscription.current_period_end || null } : null,
        usage: {
          looks: counter('look_generations_per_month'),
          analyses: counter('ai_analyses_per_month'),
          inspirations: counter('inspiration_analyses_per_month')
        }
      }
    })
    .filter((user) => !search || user.email.toLowerCase().includes(search) || user.displayName.toLowerCase().includes(search))
  const users = search ? filteredUsers.slice(rangeStart, rangeStart + perPage) : filteredUsers
  return { users, page, hasMore: search ? filteredUsers.length > rangeStart + perPage : hasMore }
}
