import { NextResponse } from 'next/server'
import { z } from 'zod'

import { DomainError } from '@/domain/shared/errors'
import { getAuthContext } from '@/lib/auth/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { assertSameOrigin, safeJsonError } from '@/lib/security/request'

const schema = z.object({ confirmation: z.literal('EXCLUIR') }).strict()

export async function GET() {
  try {
    const { supabase, user, profile } = await getAuthContext()
    const [preferencesResult, clothingResult, outfitsResult, feedbackResult, historyResult, inspirationsResult, notificationsResult, subscriptionsResult, aiUsageResult] = await Promise.all([
      supabase.from('user_preferences').select('default_vibe, preferred_formality, avoided_colors, units').eq('owner_id', user.id).maybeSingle(),
      supabase.from('clothing_items').select('id, name, category, subcategory, colors, pattern, material, fit, formality, seasons, weather_range, availability, analysis_status, analysis_version, notes, created_at, updated_at').eq('owner_id', user.id).is('deleted_at', null).order('created_at', { ascending: true }),
      supabase.from('outfits').select('id, occasion, vibe, weather_snapshot, engine_version, ranking_version, explanation, score, status, created_at, outfit_items(clothing_item_id, role, position)').eq('owner_id', user.id).order('created_at', { ascending: true }),
      supabase.from('outfit_feedback').select('outfit_id, kind, reason, updated_at').eq('owner_id', user.id),
      supabase.from('outfit_history').select('id, outfit_id, used_on, source, created_at').eq('owner_id', user.id).order('created_at', { ascending: true }),
      supabase.from('inspirations').select('id, source_type, source_url, analysis_status, analysis_version, attributes, created_at, updated_at, inspiration_matches(clothing_item_id, match_type, score, explanation, engine_version)').eq('owner_id', user.id).is('deleted_at', null).order('created_at', { ascending: true }),
      supabase.from('notifications').select('id, kind, title, body, metadata, read_at, created_at').eq('owner_id', user.id).order('created_at', { ascending: true }),
      supabase.from('subscriptions').select('status, current_period_start, current_period_end, cancel_at_period_end, canceled_at, plans(code, name)').eq('owner_id', user.id).order('created_at', { ascending: false }),
      supabase.from('ai_usage').select('provider, model, operation, input_tokens, output_tokens, estimated_cost_minor, duration_ms, status, error_code, created_at').eq('owner_id', user.id).order('created_at', { ascending: true })
    ])
    const results = [preferencesResult, clothingResult, outfitsResult, feedbackResult, historyResult, inspirationsResult, notificationsResult, subscriptionsResult, aiUsageResult]
    if (results.some((result) => result.error)) throw new DomainError('dependency_unavailable', 'Não foi possível preparar seus dados agora.')
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: { id: user.id, email: user.email || null, displayName: profile?.display_name || null, onboardingStatus: profile?.onboarding_status || null, createdAt: user.created_at },
      preferences: preferencesResult.data || null,
      clothingItems: clothingResult.data || [],
      outfits: outfitsResult.data || [],
      feedback: feedbackResult.data || [],
      history: historyResult.data || [],
      inspirations: inspirationsResult.data || [],
      notifications: notificationsResult.data || [],
      subscriptions: subscriptionsResult.data || [],
      aiUsage: aiUsageResult.data || []
    }
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Disposition': 'attachment; filename="roupzy-meus-dados.json"'
      }
    })
  } catch (error) {
    return safeJsonError(error)
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request)
    const { user } = await getAuthContext()
    const input = schema.parse(await request.json())
    const admin = createSupabaseAdminClient()
    for (const bucket of ['clothing-images', 'inspiration-images']) {
      let offset = 0
      while (true) {
        const { data: objects, error: listError } = await admin.storage.from(bucket).list(user.id, { limit: 1000, offset })
        if (listError) throw new DomainError('dependency_unavailable', 'Não foi possível limpar os arquivos privados da conta.')
        if (!objects?.length) break
        const paths = objects.filter((object) => object.id).map((object) => user.id + '/' + object.name)
        if (paths.length) {
          const { error: removeError } = await admin.storage.from(bucket).remove(paths)
          if (removeError) throw new DomainError('dependency_unavailable', 'Não foi possível limpar os arquivos privados da conta.')
        }
        if (objects.length < 1000) break
        offset += objects.length
      }
    }
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) throw new DomainError('dependency_unavailable', 'Não foi possível concluir a exclusão agora.')
    await admin.from('audit_logs').insert({
      actor_id: null,
      actor_role: 'user',
      action: 'delete_account',
      resource_type: 'user',
      resource_id: user.id,
      outcome: 'success',
      metadata: { actorId: user.id }
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return safeJsonError(error)
  }
}
