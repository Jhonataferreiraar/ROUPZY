import 'server-only'

import { DomainError } from '@/domain/shared/errors'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getServerEnv } from '@/lib/config/env'

function isoDaysAgo(days: number) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function buildDaySeries(rows: Array<{ created_at: string }> = [], days: number) {
  const counts = new Map()
  for (const row of rows || []) {
    const day = new Date(row.created_at).toISOString().slice(0, 10)
    counts.set(day, (counts.get(day) || 0) + 1)
  }
  return Array.from({ length: days }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (days - index - 1))
    const key = date.toISOString().slice(0, 10)
    return { day: key.slice(5).replace('-', '/'), value: counts.get(key) || 0 }
  })
}

export async function getAdminDashboardData() {
  const admin = createSupabaseAdminClient()
  const env = getServerEnv()
  const thirtyDaysAgo = isoDaysAgo(30)
  const fourteenDaysAgo = isoDaysAgo(13)
  const [
    totalUsersResult,
    activeUsersResult,
    newUsersResult,
    piecesResult,
    looksResult,
    favoritesResult,
    usedResult,
    aiUsageResult,
    subscriptionsResult,
    contactsResult,
    feedbackResult,
    profileTrendResult,
    onboardingCompletedResult,
    onboardingInProgressResult,
    onboardingNotStartedResult,
    auditResult,
    billingEventsResult,
    storageResult
  ] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('last_seen_at', thirtyDaysAgo),
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    admin.from('clothing_items').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    admin.from('outfits').select('id', { count: 'exact', head: true }),
    admin.from('outfit_feedback').select('outfit_id', { count: 'exact', head: true }).eq('kind', 'favorited'),
    admin.from('outfit_history').select('id', { count: 'exact', head: true }),
    admin.from('ai_usage').select('estimated_cost_minor, duration_ms, status, operation, created_at').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: false }).limit(1000),
    admin.from('subscriptions').select('id', { count: 'exact', head: true }).in('status', ['trialing', 'active']),
    admin.from('contact_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    admin.from('feedback').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    admin.from('profiles').select('created_at').gte('created_at', fourteenDaysAgo).limit(5000),
    admin.from('profiles').select('id', { count: 'exact', head: true }).eq('onboarding_status', 'completed'),
    admin.from('profiles').select('id', { count: 'exact', head: true }).eq('onboarding_status', 'in_progress'),
    admin.from('profiles').select('id', { count: 'exact', head: true }).eq('onboarding_status', 'not_started'),
    admin.from('audit_logs').select('id, actor_id, actor_role, action, resource_type, resource_id, outcome, created_at').order('created_at', { ascending: false }).limit(24),
    admin.from('billing_events').select('amount_minor, currency').gte('created_at', thirtyDaysAgo).limit(5000),
    admin.storage.listBuckets()
  ])

  const requiredResults = [
    totalUsersResult, activeUsersResult, newUsersResult, piecesResult, looksResult,
    favoritesResult, usedResult, aiUsageResult, subscriptionsResult, contactsResult,
    feedbackResult, profileTrendResult, onboardingCompletedResult, onboardingInProgressResult,
    onboardingNotStartedResult, auditResult, billingEventsResult, storageResult
  ]
  if (requiredResults.some((result) => result.error)) {
    throw new DomainError('dependency_unavailable', 'Não foi possível carregar a visão global do produto.')
  }

  const usageRows = aiUsageResult.data || []
  const costRows = usageRows.filter((row) => typeof row.estimated_cost_minor === 'number')
  const costMinor = costRows.reduce((total, row) => total + row.estimated_cost_minor, 0)
  const revenueMinor = (billingEventsResult.data || []).reduce((total, row) => total + (row.amount_minor || 0), 0)
  const durations = usageRows.map((row) => row.duration_ms).filter((duration) => typeof duration === 'number')

  return {
    metrics: {
      totalUsers: totalUsersResult.count || 0,
      activeUsers: activeUsersResult.count || 0,
      newUsers: newUsersResult.count || 0,
      pieces: piecesResult.count || 0,
      looks: looksResult.count || 0,
      favorites: favoritesResult.count || 0,
      used: usedResult.count || 0,
      activeSubscriptions: subscriptionsResult.count || 0,
      newContacts: contactsResult.count || 0,
      newFeedback: feedbackResult.count || 0,
      revenue: (revenueMinor / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      aiCalls: usageRows.length,
      aiFailures: usageRows.filter((row) => row.status !== 'success').length,
      aiCost: costRows.length ? (costMinor / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não calculado',
      aiLatency: durations.length ? Math.round(durations.reduce((total, duration) => total + duration, 0) / durations.length) + ' ms' : '—'
    },
    onboarding: {
      completed: onboardingCompletedResult.count || 0,
      in_progress: onboardingInProgressResult.count || 0,
      not_started: onboardingNotStartedResult.count || 0
    },
    signups: buildDaySeries(profileTrendResult.data || [], 14),
    audit: auditResult.data || [],
    health: {
      database: true,
      ai: Boolean(env.GEMINI_API_KEY),
      billing: Boolean(env.BILLING_PROVIDER && env.BILLING_WEBHOOK_SECRET),
      storage: (storageResult.data || []).some((bucket) => bucket.id === 'clothing-images' && bucket.public === false)
    }
  }
}
