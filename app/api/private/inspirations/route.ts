import { randomUUID } from 'node:crypto'

import { NextResponse } from 'next/server'

import { DomainError } from '@/domain/shared/errors'
import { getAuthContext } from '@/lib/auth/server'
import { getEffectivePlanLimits, type SupabaseLike } from '@/lib/billing/entitlements'
import { assertSameOrigin, safeJsonError } from '@/lib/security/request'
import { consumeRateLimit, rateLimitKey } from '@/lib/security/rate-limit'
import { validateImageFile } from '@/lib/storage/image-validation'

type StorageClient = SupabaseLike & {
  storage: { from: (bucket: string) => { createSignedUrl: (path: string, expiresIn: number) => Promise<{ data: { signedUrl?: string } | null }> } }
}

type InspirationAsset = { bucket?: string; object_path?: string }

function signedAssetUrl(supabase: StorageClient, asset: InspirationAsset | InspirationAsset[] | null) {
  const firstAsset = Array.isArray(asset) ? asset[0] : asset
  if (!firstAsset?.bucket || !firstAsset?.object_path) return Promise.resolve(null)
  return supabase.storage.from(firstAsset.bucket).createSignedUrl(firstAsset.object_path, 3600).then(({ data }) => data?.signedUrl || null)
}

export async function GET() {
  try {
    const { supabase, user } = await getAuthContext()
    const { data: inspirations, error } = await supabase
      .from('inspirations')
      .select('id, source_type, source_url, analysis_status, analysis_version, attributes, created_at, media_assets(bucket, object_path), inspiration_matches(id, clothing_item_id, match_type, score, explanation, clothing_items(id, name, category, colors, formality, asset_id))')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(30)
    if (error) throw new DomainError('dependency_unavailable', 'Não foi possível carregar suas inspirações.')
    const output = await Promise.all((inspirations || []).map(async (inspiration) => ({
      ...inspiration,
      assetUrl: await signedAssetUrl(supabase, inspiration.media_assets),
      media_assets: undefined
    })))
    return NextResponse.json({ inspirations: output })
  } catch (error) {
    return safeJsonError(error)
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const { supabase, user } = await getAuthContext()
    await consumeRateLimit(supabase, rateLimitKey('inspiration:write', user.id), 20, 3600)
    const limits = await getEffectivePlanLimits(supabase, user.id)
    const form = await request.formData()
    const candidate = form.get('file')
    if (!(candidate instanceof File) || candidate.size <= 0) throw new DomainError('validation', 'Escolha uma imagem de referência.')
    const image = await validateImageFile(candidate)
    const objectPath = user.id + '/' + randomUUID() + '.' + image.extension
    const body = new Uint8Array(await candidate.arrayBuffer())
    const { error: uploadError } = await supabase.storage.from('inspiration-images').upload(objectPath, body, { contentType: image.mimeType, cacheControl: '3600', upsert: false })
    if (uploadError) throw new DomainError('dependency_unavailable', 'Não foi possível guardar a referência com segurança.')
    const { data: asset, error: assetError } = await supabase.from('media_assets').insert({ owner_id: user.id, bucket: 'inspiration-images', object_path: objectPath, purpose: 'inspiration', sha256: image.sha256, mime_type: image.mimeType, byte_size: image.byteSize, width: image.width, height: image.height, status: 'ready' }).select('id').single()
    if (assetError || !asset) {
      await supabase.storage.from('inspiration-images').remove([objectPath])
      throw new DomainError('dependency_unavailable', 'Não foi possível registrar a referência.')
    }
    const { data: inspiration, error: inspirationError } = await supabase.from('inspirations').insert({ owner_id: user.id, asset_id: asset.id, source_type: 'upload', analysis_status: 'manual_review', attributes: {} }).select('id, source_type, source_url, analysis_status, analysis_version, attributes, created_at').single()
    if (inspirationError || !inspiration) {
      await supabase.storage.from('inspiration-images').remove([objectPath])
      throw new DomainError('dependency_unavailable', 'Não foi possível criar a referência.')
    }
    const { data: signed } = await supabase.storage.from('inspiration-images').createSignedUrl(objectPath, 3600)
    return NextResponse.json({ inspiration: { ...inspiration, assetUrl: signed?.signedUrl || null, analysisLimit: limits.maxInspirationAnalysesPerMonth } }, { status: 201 })
  } catch (error) {
    return safeJsonError(error)
  }
}
