import 'server-only'

import { cache } from 'react'
import { headers } from 'next/headers'

import { DomainError } from '@/domain/shared/errors'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const getAuthContext = cache(async function getAuthContext() {
  const supabase = await createSupabaseServerClient()
  const requestHeaders = await headers()
  const forwardedUserId = requestHeaders.get('x-roupzy-auth-user')
  const forwardedUserEmail = requestHeaders.get('x-roupzy-auth-email') || undefined
  const forwardedUserCreatedAt = requestHeaders.get('x-roupzy-auth-created-at') || undefined
  const isForwardedUserIdValid = Boolean(
    forwardedUserId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(forwardedUserId)
  )

  let user: { id: string; email?: string; created_at?: string } | null = isForwardedUserIdValid
    ? { id: forwardedUserId as string, email: forwardedUserEmail, created_at: forwardedUserCreatedAt }
    : null

  if (!user) {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) throw new DomainError('unauthorized', 'Entre para acessar seu espaço.')
    user = data.user
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, onboarding_status, blocked_at, last_seen_at')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) throw new DomainError('dependency_unavailable', 'Não foi possível carregar seu perfil.')
  if (profile?.blocked_at) throw new DomainError('forbidden', 'Este acesso está temporariamente bloqueado.')

  const lastSeen = profile?.last_seen_at ? Date.parse(profile.last_seen_at) : 0
  if (!lastSeen || Date.now() - lastSeen > 5 * 60 * 1000) {
    await supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', user.id)
  }

  return { supabase, user, profile }
})

export const requireAdmin = cache(async function requireAdmin() {
  const context = await getAuthContext()
  const { data: role, error } = await context.supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', context.user.id)
    .is('revoked_at', null)
    .maybeSingle()
  if (error) throw new DomainError('dependency_unavailable', 'Não foi possível validar a área administrativa.')
  if (!role) throw new DomainError('forbidden', 'Você não tem acesso a esta área.')
  return { ...context, role: role.role as 'support' | 'manager' | 'owner' }
})
