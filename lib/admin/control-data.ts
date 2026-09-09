import 'server-only'

import { DomainError } from '@/domain/shared/errors'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function getAdminControlData(section?: string | null) {
  const admin = createSupabaseAdminClient()
  const includeProduct = !section || section === 'product'
  const includeSettings = !section || section === 'settings'
  const includeSupport = !section || section === 'support'
  const [plansResult, settingsResult, flagsResult, feedbackResult, contactsResult] = await Promise.all([
    includeProduct ? admin.from('plans').select('id, code, name, description, active, price_minor, currency, billing_interval, limits, features, display_order').order('display_order', { ascending: true }) : Promise.resolve(null),
    includeSettings ? admin.from('system_settings').select('key, value, environment, updated_at').order('key', { ascending: true }) : Promise.resolve(null),
    includeSettings ? admin.from('feature_flags').select('key, enabled, rollout_percent, starts_at, ends_at, updated_at').order('key', { ascending: true }) : Promise.resolve(null),
    includeSupport ? admin.from('feedback').select('id, category, body, status, response, created_at').order('created_at', { ascending: false }).limit(12) : Promise.resolve(null),
    includeSupport ? admin.from('contact_requests').select('id, name, email, subject, body, status, created_at').order('created_at', { ascending: false }).limit(12) : Promise.resolve(null)
  ])

  if (plansResult?.error || settingsResult?.error || flagsResult?.error || feedbackResult?.error || contactsResult?.error) {
    throw new DomainError('dependency_unavailable', 'Não foi possível carregar os controles do negócio.')
  }

  return {
    plans: plansResult?.data || [],
    settings: settingsResult?.data || [],
    flags: flagsResult?.data || [],
    feedback: feedbackResult?.data || [],
    contacts: contactsResult?.data || []
  }
}
