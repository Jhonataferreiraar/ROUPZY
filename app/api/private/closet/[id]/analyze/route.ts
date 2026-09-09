import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createAIProvider, createAIRequestKey } from '@/lib/ai/gemini'
import { DomainError } from '@/domain/shared/errors'
import { getAuthContext } from '@/lib/auth/server'
import { commitPlanQuota, getEffectivePlanLimits, releasePlanQuota, reservePlanQuota, type SupabaseLike } from '@/lib/billing/entitlements'
import { getServerEnv } from '@/lib/config/env'
import { productLimits } from '@/lib/config/limits'
import { assertSameOrigin, safeJsonError } from '@/lib/security/request'
import { consumeRateLimit, rateLimitKey } from '@/lib/security/rate-limit'

const imageMimeSchema = z.enum(['image/jpeg', 'image/png', 'image/webp'])

function usageStatus(error: unknown) {
  if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) return 'timeout'
  if (error instanceof DomainError && error.code === 'validation') return 'rejected'
  return 'failed'
}

function usageErrorCode(error: unknown) {
  if (error instanceof DomainError) return error.code
  if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) return 'timeout'
  return 'provider_error'
}

function configuredAiModel() {
  return getServerEnv().GEMINI_MODEL || 'gemini-2.0-flash'
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let context: Awaited<ReturnType<typeof getAuthContext>> | null = null
  let requestKey: string | null = null
  let quotaContext: { supabase: SupabaseLike; userId: string; metricName: string } | null = null
  try {
    assertSameOrigin(request)
    context = await getAuthContext()
    const { supabase, user } = context
    const id = z.string().uuid().parse((await params).id)
    const { data: item, error: itemError } = await supabase
      .from('clothing_items')
      .select('id, asset_id, category, subcategory, colors, pattern, material, fit, formality, seasons, weather_range, analysis_status, analysis_version')
      .eq('id', id)
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .maybeSingle()
    if (itemError) throw new DomainError('dependency_unavailable', 'Não foi possível carregar essa peça.')
    if (!item) throw new DomainError('not_found', 'Peça não encontrada.')
    if (item.analysis_status === 'ready') {
      return NextResponse.json({
        itemId: id,
        reused: true,
        attributes: {
          category: item.category,
          subcategory: item.subcategory,
          colors: item.colors,
          pattern: item.pattern,
          material: item.material,
          fit: item.fit,
          formality: item.formality,
          seasons: item.seasons,
          weatherRange: item.weather_range
        }
      })
    }
    await consumeRateLimit(supabase, rateLimitKey('ai:clothing', user.id), productLimits.maxAiAnalysesPerMonth, 31 * 24 * 60 * 60)
    const planLimits = await getEffectivePlanLimits(supabase, user.id)
    if (!item.asset_id) throw new DomainError('validation', 'Adicione uma foto antes de analisar a peça.')
    const { data: asset, error: assetError } = await supabase.from('media_assets').select('bucket, object_path, mime_type').eq('id', item.asset_id).eq('owner_id', user.id).maybeSingle()
    if (assetError) throw new DomainError('dependency_unavailable', 'Não foi possível carregar a imagem da peça.')
    if (!asset) throw new DomainError('not_found', 'Imagem da peça não encontrada.')
    const { data: file, error: downloadError } = await supabase.storage.from(asset.bucket).download(asset.object_path)
    if (downloadError || !file) throw new DomainError('dependency_unavailable', 'Não foi possível ler a imagem privada.')
    quotaContext = { supabase, userId: user.id, metricName: await reservePlanQuota(supabase, user.id, 'maxAiAnalysesPerMonth', planLimits.maxAiAnalysesPerMonth) }
    const provider = createAIProvider()
    requestKey = createAIRequestKey('clothing:' + id)
    const result = await provider.analyzeClothing({
      imageBase64: Buffer.from(await file.arrayBuffer()).toString('base64'),
      mimeType: imageMimeSchema.parse(asset.mime_type),
      requestKey
    })
    const { error: updateError } = await supabase.from('clothing_items').update({
      category: result.data.category,
      subcategory: result.data.subcategory,
      colors: result.data.colors,
      pattern: result.data.pattern,
      material: result.data.material,
      fit: result.data.fit,
      formality: result.data.formality,
      seasons: result.data.seasons,
      weather_range: result.data.weatherRange,
      analysis_status: 'ready',
      analysis_version: result.model
    }).eq('id', id).eq('owner_id', user.id)
    if (updateError) throw new DomainError('dependency_unavailable', 'Não foi possível guardar a análise.')
    const { error: usageInsertError } = await supabase.from('ai_usage').insert({
      owner_id: user.id,
      provider: result.provider,
      model: result.model,
      operation: result.operation,
      request_key: result.requestKey,
      input_tokens: result.usage.inputTokens,
      output_tokens: result.usage.outputTokens,
      estimated_cost_minor: result.usage.estimatedCostMinor,
      duration_ms: result.durationMs,
      status: 'success'
    })
    if (usageInsertError) throw new DomainError('dependency_unavailable', 'Não foi possível registrar o uso da análise.')
    await commitPlanQuota(supabase, user.id, quotaContext.metricName)
    quotaContext = null
    return NextResponse.json({ itemId: id, reused: false, analysisVersion: result.model, attributes: result.data })
  } catch (error) {
    if (quotaContext) await releasePlanQuota(quotaContext.supabase, quotaContext.userId, quotaContext.metricName).catch(() => undefined)
    if (context && requestKey) {
      await context.supabase.from('ai_usage').insert({
        owner_id: context.user.id,
        provider: 'gemini',
        model: configuredAiModel(),
        operation: 'analyzeClothing',
        request_key: requestKey,
        status: usageStatus(error),
        error_code: usageErrorCode(error)
      })
    }
    return safeJsonError(error)
  }
}
