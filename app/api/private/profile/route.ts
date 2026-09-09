import { NextResponse } from 'next/server'
import { z } from 'zod'

import { DomainError } from '@/domain/shared/errors'
import { getAuthContext } from '@/lib/auth/server'
import { assertSameOrigin, safeJsonError } from '@/lib/security/request'

const schema = z.object({
  displayName: z.string().trim().min(1).max(120).optional(),
  defaultVibe: z.string().trim().max(80).nullable().optional(),
  preferredFormality: z.number().int().min(1).max(5).nullable().optional(),
  avoidedColors: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  onboardingStatus: z.enum(['not_started', 'in_progress', 'completed']).optional()
}).strict()

export async function GET() {
  try {
    const { supabase, user, profile } = await getAuthContext()
    const { data: preferences, error: preferencesError } = await supabase.from('user_preferences').select('default_vibe, preferred_formality, avoided_colors, units').eq('owner_id', user.id).maybeSingle()
    if (preferencesError) throw new DomainError('dependency_unavailable', 'Não foi possível carregar suas preferências.')
    return NextResponse.json({ profile, preferences })
  } catch (error) {
    return safeJsonError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request)
    const { supabase, user } = await getAuthContext()
    const input = schema.parse(await request.json())
    const profileUpdate = {
      ...(input.displayName === undefined ? {} : { display_name: input.displayName }),
      ...(input.onboardingStatus === undefined ? {} : { onboarding_status: input.onboardingStatus })
    }
    if (Object.keys(profileUpdate).length) {
      const { error } = await supabase.from('profiles').update(profileUpdate).eq('id', user.id)
      if (error) return NextResponse.json({ error: 'Não foi possível atualizar seu perfil.' }, { status: 400 })
    }
    const preferences = {
      owner_id: user.id,
      ...(input.defaultVibe === undefined ? {} : { default_vibe: input.defaultVibe }),
      ...(input.preferredFormality === undefined ? {} : { preferred_formality: input.preferredFormality }),
      ...(input.avoidedColors === undefined ? {} : { avoided_colors: input.avoidedColors })
    }
    if (Object.keys(preferences).length > 1) {
      const { error } = await supabase.from('user_preferences').upsert(preferences, { onConflict: 'owner_id' })
      if (error) return NextResponse.json({ error: 'Não foi possível atualizar suas preferências.' }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return safeJsonError(error)
  }
}
