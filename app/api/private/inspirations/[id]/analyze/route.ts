import { NextResponse } from 'next/server'
import { z } from 'zod'

import { DomainError } from '@/domain/shared/errors'
import { createAIProvider, createAIRequestKey } from '@/lib/ai/gemini'
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
    const { data: inspiration, error: inspirationError } = await supabase.from('inspirations').select('id, asset_id, analysis_status, analysis_version, attributes').eq('id', id).eq('owner_id', user.id).is('deleted_at', null).maybeSingle()
    if (inspirationError) throw new DomainError('dependency_unavailable', 'Não foi possível carregar essa referência.')
    if (!inspiration) throw new DomainError('not_found', 'Referência não encontrada.')
    if (inspiration.analysis_status === 'ready') return NextResponse.json({ inspirationId: id, reused: true, attributes: inspiration.attributes })
    await consumeRateLimit(supabase, rateLimitKey('ai:inspiration', user.id), productLimits.maxAiAnalysesPerMonth, 31 * 24 * 60 * 60)
    const limits = await getEffectivePlanLimits(supabase, user.id)
    if (!inspiration.asset_id) throw new DomainError('validation', 'Adicione uma imagem antes de analisar a referência.')
    const { data: asset, error: assetError } = await supabase.from('media_assets').select('bucket, object_path, mime_type').eq('id', inspiration.asset_id).eq('owner_id', user.id).maybeSingle()
    if (assetError || !asset) throw new DomainError('not_found', 'Imagem da referência não encontrada.')
    const { data: file, error: downloadError } = await supabase.storage.from(asset.bucket).download(asset.object_path)
    if (downloadError || !file) throw new DomainError('dependency_unavailable', 'Não foi possível ler a imagem privada.')
    quotaContext = { supabase, userId: user.id, metricName: await reservePlanQuota(supabase, user.id, 'maxInspirationAnalysesPerMonth', limits.maxInspirationAnalysesPerMonth) }
    requestKey = createAIRequestKey('inspiration:' + id)
    const result = await createAIProvider().analyzeInspiration({ imageBase64: Buffer.from(await file.arrayBuffer()).toString('base64'), mimeType: imageMimeSchema.parse(asset.mime_type), requestKey })
    const { error: updateError } = await supabase.from('inspirations').update({ attributes: result.data, analysis_status: 'ready', analysis_version: result.model }).eq('id', id).eq('owner_id', user.id)
    if (updateError) throw new DomainError('dependency_unavailable', 'Não foi possível guardar a análise da referência.')
    const { error: usageInsertError } = await supabase.from('ai_usage').insert({ owner_id: user.id, provider: result.provider, model: result.model, operation: result.operation, request_key: result.requestKey, input_tokens: result.usage.inputTokens, output_tokens: result.usage.outputTokens, estimated_cost_minor: result.usage.estimatedCostMinor, duration_ms: result.durationMs, status: 'success' })
    if (usageInsertError) throw new DomainError('dependency_unavailable', 'Não foi possível registrar o uso da análise.')
    await commitPlanQuota(supabase, user.id, quotaContext.metricName)
    quotaContext = null
    return NextResponse.json({ inspirationId: id, reused: false, analysisVersion: result.model, attributes: result.data })
  } catch (error) {
    if (quotaContext) await releasePlanQuota(quotaContext.supabase, quotaContext.userId, quotaContext.metricName).catch(() => undefined)
    if (context && requestKey) await context.supabase.from('ai_usage').insert({ owner_id: context.user.id, provider: 'gemini', model: configuredAiModel(), operation: 'analyzeInspiration', request_key: requestKey, status: usageStatus(error), error_code: usageErrorCode(error) })
    return safeJsonError(error)
  }
}
