/* Signed Supabase URLs are private and dynamic, so this detail view uses a plain image element. */
/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { z } from 'zod'

import { getAuthContext } from '@/lib/auth/server'
import { clothingCategoryLabel } from '@/lib/ui/labels'
import { ClothingItemActions } from '@/components/clothing-item-actions'
import { requireSupabaseResult } from '@/lib/supabase/result'

export const dynamic = 'force-dynamic'

export default async function ClosetItemPage({ params }) {
  const { supabase, user } = await getAuthContext()
  const id = z.string().uuid().safeParse((await params).id)
  if (!id.success) notFound()
  const itemResult = await supabase.from('clothing_items').select('id, asset_id, name, category, colors, pattern, fit, formality, seasons, notes, availability, analysis_status, created_at, media_assets(bucket, object_path)').eq('id', id.data).eq('owner_id', user.id).is('deleted_at', null).maybeSingle()
  const item = requireSupabaseResult(itemResult, 'Não foi possível carregar esta peça.')
  if (!item) notFound()
  const asset = Array.isArray(item.media_assets) ? item.media_assets[0] : item.media_assets
  const assetUrl = asset?.bucket && asset?.object_path
    ? (await supabase.storage.from(asset.bucket).createSignedUrl(asset.object_path, 3600)).data?.signedUrl || null
    : null
  return (
    <div className="app-page shell app-narrow-page">
      <Link className="app-back-link" href="/app/closet">← Voltar ao arquivo</Link>
      <section className="item-detail-card"><div className="app-item-detail-visual">{assetUrl ? <img src={assetUrl} alt={'Foto de ' + item.name} /> : <div className="app-item-detail-shape" aria-hidden="true" />}</div><div><span className="app-kicker">PEÇA REGISTRADA</span><h1>{item.name}</h1><p>{clothingCategoryLabel(item.category)} · {item.colors?.[0]?.name || 'cor a confirmar'} · formalidade {item.formality}/5</p><small>{item.analysis_status === 'ready' ? 'Análise confirmada.' : 'Aguardando sua confirmação.'}</small><p>{item.notes || 'Sem observações adicionadas.'}</p><ClothingItemActions item={item} /></div></section>
    </div>
  )
}
