import { randomUUID } from 'node:crypto'

import { NextResponse } from 'next/server'

import { clothingCreateSchema } from '@/domain/clothing/schema'
import { DomainError } from '@/domain/shared/errors'
import { getAuthContext } from '@/lib/auth/server'
import { getEffectivePlanLimits } from '@/lib/billing/entitlements'
import { assertSameOrigin, safeJsonError } from '@/lib/security/request'
import { consumeRateLimit, rateLimitKey } from '@/lib/security/rate-limit'
import { validateImageFile } from '@/lib/storage/image-validation'

function publicItem(item: Record<string, unknown>, assetUrl: string | null) {
  return { ...item, assetUrl }
}

export async function GET() {
  try {
    const { supabase, user } = await getAuthContext()
    const { data: items, error } = await supabase
      .from('clothing_items')
      .select('id, asset_id, name, category, subcategory, colors, pattern, material, fit, formality, seasons, weather_range, availability, analysis_status, notes, created_at, updated_at')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    if (error) throw new DomainError('dependency_unavailable', 'Não foi possível carregar o closet.')
    const output = await Promise.all((items || []).map(async (item) => {
      if (!item.asset_id) return publicItem(item, null)
      const { data: asset } = await supabase.from('media_assets').select('object_path, bucket').eq('id', item.asset_id).eq('owner_id', user.id).maybeSingle()
      if (!asset) return publicItem(item, null)
      const { data: signed } = await supabase.storage.from(asset.bucket).createSignedUrl(asset.object_path, 3600)
      return publicItem(item, signed?.signedUrl || null)
    }))
    return NextResponse.json({ items: output })
  } catch (error) {
    return safeJsonError(error)
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const { supabase, user } = await getAuthContext()
    await consumeRateLimit(supabase, rateLimitKey('closet:write', user.id), 40, 3600)
    const planLimits = await getEffectivePlanLimits(supabase, user.id)
    const { count, error: countError } = await supabase
      .from('clothing_items')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .is('deleted_at', null)
    if (countError) throw new DomainError('dependency_unavailable', 'Não foi possível verificar o limite do closet.')
    if ((count || 0) >= planLimits.maxClosetItems) throw new DomainError('rate_limited', 'Seu plano atingiu o limite de peças.')

    const contentType = request.headers.get('content-type') || ''
    let input
    let file: File | null = null
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      const metadata = form.get('metadata')
      input = clothingCreateSchema.parse(metadata ? JSON.parse(String(metadata)) : { name: 'Peça sem nome' })
      const candidate = form.get('file')
      if (candidate instanceof File && candidate.size > 0) file = candidate
    } else {
      input = clothingCreateSchema.parse(await request.json())
    }

    let assetId: string | null = null
    let objectPath: string | null = null
    if (file) {
      const image = await validateImageFile(file)
      objectPath = user.id + '/' + randomUUID() + '.' + image.extension
      const body = new Uint8Array(await file.arrayBuffer())
      const { error: uploadError } = await supabase.storage.from('clothing-images').upload(objectPath, body, {
        contentType: image.mimeType,
        cacheControl: '3600',
        upsert: false
      })
      if (uploadError) throw new DomainError('dependency_unavailable', 'Não foi possível guardar a imagem com segurança.')
      const { data: asset, error: assetError } = await supabase.from('media_assets').insert({
        owner_id: user.id,
        bucket: 'clothing-images',
        object_path: objectPath,
        purpose: 'clothing',
        sha256: image.sha256,
        mime_type: image.mimeType,
        byte_size: image.byteSize,
        width: image.width,
        height: image.height,
        status: 'ready'
      }).select('id').single()
      if (assetError || !asset) {
        await supabase.storage.from('clothing-images').remove([objectPath])
        throw new DomainError('dependency_unavailable', 'Não foi possível registrar a imagem.')
      }
      assetId = asset.id
    }

    const { data: item, error } = await supabase.from('clothing_items').insert({
      owner_id: user.id,
      asset_id: assetId,
      name: input.name,
      category: input.category,
      subcategory: input.subcategory,
      colors: input.colors,
      pattern: input.pattern,
      material: input.material,
      fit: input.fit,
      formality: input.formality,
      seasons: input.seasons,
      weather_range: input.weatherRange,
      notes: input.notes,
      analysis_status: 'manual_review'
    }).select('id, asset_id, name, category, subcategory, colors, pattern, material, fit, formality, seasons, weather_range, availability, analysis_status, notes, created_at, updated_at').single()
    if (error || !item) {
      if (objectPath) await supabase.storage.from('clothing-images').remove([objectPath])
      throw new DomainError('dependency_unavailable', 'Não foi possível adicionar essa peça.')
    }
    const assetUrl = objectPath
      ? (await supabase.storage.from('clothing-images').createSignedUrl(objectPath, 3600)).data?.signedUrl || null
      : null
    return NextResponse.json({ item: publicItem(item, assetUrl) }, { status: 201 })
  } catch (error) {
    return safeJsonError(error)
  }
}
