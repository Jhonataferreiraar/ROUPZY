import Link from 'next/link'

import { ClosetManager } from '@/components/closet-manager'
import { getAuthContext } from '@/lib/auth/server'
import { requireSupabaseResult } from '@/lib/supabase/result'

export const dynamic = 'force-dynamic'

export default async function ClosetPage() {
  const { supabase, user } = await getAuthContext()
  const result = await supabase.from('clothing_items').select('id, asset_id, name, category, colors, formality, availability, analysis_status, notes, created_at, media_assets(bucket, object_path)').eq('owner_id', user.id).is('deleted_at', null).order('created_at', { ascending: false })
  const rows = requireSupabaseResult(result, 'Não foi possível carregar o seu closet.')
  const items = await Promise.all((rows || []).map(async (row) => {
    const asset = Array.isArray(row.media_assets) ? row.media_assets[0] : row.media_assets
    const item = { ...row }
    delete item.media_assets
    const assetUrl = asset?.bucket && asset?.object_path
      ? (await supabase.storage.from(asset.bucket).createSignedUrl(asset.object_path, 3600)).data?.signedUrl || null
      : null
    return { ...item, assetUrl }
  }))
  return (
    <div className="app-page shell">
      <div className="app-page-intro"><div><span className="app-kicker">ROUPZY / ARQUIVO</span><h1>Seu closet<br />{' '}<em>em foco.</em></h1><p>Registre o que você já tem. O sistema cuida da organização para as escolhas ficarem mais simples.</p></div><Link className="app-outline-button" href="/app/looks/criar">Montar um look <span>↗</span></Link></div>
      <ClosetManager initialItems={items || []} />
    </div>
  )
}
