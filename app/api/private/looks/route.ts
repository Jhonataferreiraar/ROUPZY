import { NextResponse } from 'next/server'
import { z } from 'zod'

import { generateOutfits, type OutfitPiece } from '@/domain/outfits/engine'
import { DomainError } from '@/domain/shared/errors'
import { getAuthContext } from '@/lib/auth/server'
import { commitPlanQuota, getEffectivePlanLimits, releasePlanQuota, reservePlanQuota, type SupabaseLike } from '@/lib/billing/entitlements'
import { productLimits } from '@/lib/config/limits'
import { assertSameOrigin, safeJsonError } from '@/lib/security/request'
import { consumeRateLimit, rateLimitKey } from '@/lib/security/rate-limit'

const requestSchema = z.object({
  occasion: z.string().trim().min(1).max(80),
  vibe: z.string().trim().min(1).max(80),
  weatherC: z.number().min(-50).max(70).nullable().optional()
}).strict()

export async function GET() {
  try {
    const { supabase, user } = await getAuthContext()
    const { data: outfits, error } = await supabase
      .from('outfits')
      .select('id, occasion, vibe, weather_snapshot, engine_version, explanation, score, status, created_at, outfit_items(clothing_item_id, role, position, clothing_items(id, name, category, colors, formality, asset_id))')
      .eq('owner_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(30)
    if (error) throw new DomainError('dependency_unavailable', 'Não foi possível carregar seus looks.')
    return NextResponse.json({ outfits: outfits || [] })
  } catch (error) {
    return safeJsonError(error)
  }
}

export async function POST(request: Request) {
  let context: Awaited<ReturnType<typeof getAuthContext>> | null = null
  let quotaContext: { supabase: SupabaseLike; userId: string; metricName: string } | null = null
  const createdOutfitIds: string[] = []
  try {
    assertSameOrigin(request)
    context = await getAuthContext()
    const { supabase, user } = context
    await consumeRateLimit(supabase, rateLimitKey('looks:write', user.id), productLimits.maxLookGenerationsPerMonth, 31 * 24 * 60 * 60)
    const planLimits = await getEffectivePlanLimits(supabase, user.id)
    const input = requestSchema.parse(await request.json())
    quotaContext = { supabase, userId: user.id, metricName: await reservePlanQuota(supabase, user.id, 'maxLookGenerationsPerMonth', planLimits.maxLookGenerationsPerMonth) }

    const [{ data: items, error: itemError }, { data: preferences, error: preferencesError }] = await Promise.all([
      supabase.from('clothing_items').select('id, name, category, colors, formality, seasons, availability').eq('owner_id', user.id).is('deleted_at', null).eq('availability', 'active'),
      supabase.from('user_preferences').select('preferred_formality, avoided_colors').eq('owner_id', user.id).maybeSingle()
    ])
    if (itemError) throw new DomainError('dependency_unavailable', 'Não foi possível ler as peças do closet.')
    if (preferencesError) throw new DomainError('dependency_unavailable', 'Não foi possível ler suas preferências.')
    const pieces = (items || []) as OutfitPiece[]
    const candidates = generateOutfits(pieces, {
      occasion: input.occasion,
      vibe: input.vibe,
      weatherC: input.weatherC,
      preferredFormality: preferences?.preferred_formality,
      avoidedColors: Array.isArray(preferences?.avoided_colors) ? preferences.avoided_colors : []
    })
    if (!candidates.length) throw new DomainError('validation', 'Adicione pelo menos uma parte de cima, uma parte de baixo e um sapato para gerar looks.')

    const itemById = new Map(pieces.map((item) => [item.id, item]))
    const saved = []
    for (const candidate of candidates) {
      const { data: outfit, error: outfitError } = await supabase.from('outfits').insert({
        owner_id: user.id,
        occasion: input.occasion,
        vibe: input.vibe,
        weather_snapshot: input.weatherC === undefined || input.weatherC === null ? {} : { temperatureC: input.weatherC },
        engine_version: candidate.engineVersion,
        explanation: candidate.explanation,
        score: candidate.score
      }).select('id, occasion, vibe, weather_snapshot, engine_version, explanation, score, status, created_at').single()
      if (outfitError || !outfit) throw new DomainError('dependency_unavailable', 'Não foi possível guardar uma sugestão.')
      createdOutfitIds.push(outfit.id)
      const roles = candidate.itemIds.map((id) => ({ outfit_id: outfit.id, clothing_item_id: id, owner_id: user.id, role: itemById.get(id)?.category === 'one_piece' ? 'one_piece' : itemById.get(id)?.category || 'accessory', position: candidate.itemIds.indexOf(id) }))
      const { error: relationError } = await supabase.from('outfit_items').insert(roles)
      if (relationError) throw new DomainError('dependency_unavailable', 'Não foi possível completar uma sugestão.')
      saved.push({ ...outfit, items: candidate.itemIds.map((id) => itemById.get(id)).filter(Boolean) })
    }
    await commitPlanQuota(supabase, user.id, quotaContext.metricName)
    quotaContext = null
    return NextResponse.json({ outfits: saved }, { status: 201 })
  } catch (error) {
    if (createdOutfitIds.length && context) {
      await context.supabase.from('outfits').delete().in('id', createdOutfitIds).eq('owner_id', context.user.id)
    }
    if (quotaContext) await releasePlanQuota(quotaContext.supabase, quotaContext.userId, quotaContext.metricName).catch(() => undefined)
    return safeJsonError(error)
  }
}
