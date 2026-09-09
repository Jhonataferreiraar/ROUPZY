import { NextResponse } from 'next/server'
import { z } from 'zod'

import { DomainError } from '@/domain/shared/errors'
import { getAuthContext } from '@/lib/auth/server'
import { assertSameOrigin, safeJsonError } from '@/lib/security/request'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request)
    const { supabase, user } = await getAuthContext()
    const id = z.string().uuid().parse((await params).id)
    const { data: inspiration, error: findError } = await supabase.from('inspirations').select('id, asset_id, media_assets(bucket, object_path)').eq('id', id).eq('owner_id', user.id).maybeSingle()
    if (findError) throw new DomainError('dependency_unavailable', 'Não foi possível localizar essa referência.')
    if (!inspiration) throw new DomainError('not_found', 'Referência não encontrada.')
    const asset = Array.isArray(inspiration.media_assets) ? inspiration.media_assets[0] : inspiration.media_assets
    const { error: deleteError } = await supabase.from('inspirations').delete().eq('id', id).eq('owner_id', user.id)
    if (deleteError) throw new DomainError('dependency_unavailable', 'Não foi possível excluir essa referência.')
    if (asset?.bucket && asset?.object_path) await supabase.storage.from(asset.bucket).remove([asset.object_path])
    if (inspiration.asset_id) await supabase.from('media_assets').delete().eq('id', inspiration.asset_id).eq('owner_id', user.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return safeJsonError(error)
  }
}
