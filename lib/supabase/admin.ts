import 'server-only'

import { createClient } from '@supabase/supabase-js'

import { DomainError } from '@/domain/shared/errors'
import { getServerEnv } from '@/lib/config/env'

export function createSupabaseAdminClient() {
  const env = getServerEnv()
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new DomainError('dependency_unavailable', 'A área administrativa precisa da chave server-side do Supabase.')
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}
