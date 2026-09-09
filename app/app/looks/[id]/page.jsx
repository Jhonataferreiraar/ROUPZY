import Link from 'next/link'
import { notFound } from 'next/navigation'
import { z } from 'zod'

import { DomainError } from '@/domain/shared/errors'
import { LookActions } from '@/components/look-actions'
import { getAuthContext } from '@/lib/auth/server'
import { clothingCategoryLabel } from '@/lib/ui/labels'

export const dynamic = 'force-dynamic'

export default async function LookDetailPage({ params }) {
  const { supabase, user } = await getAuthContext()
  const id = z.string().uuid().safeParse((await params).id)
  if (!id.success) notFound()
  const { data: outfit, error } = await supabase
    .from('outfits')
    .select('id, occasion, vibe, explanation, score, engine_version, created_at, outfit_items(clothing_item_id, role, position, clothing_items(id, name, category, colors, formality))')
    .eq('id', id.data)
    .eq('owner_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  if (error || !outfit) notFound()
  const [{ data: feedback, error: feedbackError }, { data: history, error: historyError }] = await Promise.all([
    supabase.from('outfit_feedback').select('kind').eq('owner_id', user.id).eq('outfit_id', id.data).maybeSingle(),
    supabase.from('outfit_history').select('id').eq('owner_id', user.id).eq('outfit_id', id.data).order('used_on', { ascending: false }).limit(1).maybeSingle()
  ])
  if (feedbackError || historyError) throw new DomainError('dependency_unavailable', 'Não foi possível carregar as ações deste look.')
  const items = [...(outfit.outfit_items || [])].sort((a, b) => (a.position || 0) - (b.position || 0))

  return <div className="app-page shell app-narrow-page">
    <Link className="app-back-link" href="/app/looks">← Voltar aos looks</Link>
    <section className="look-detail-card">
      <div className="look-detail-heading"><div><span className="app-kicker">LOOK REGISTRADO</span><h1>{outfit.vibe || 'Combinação do dia'}</h1><p>{outfit.occasion} · criado em {new Date(outfit.created_at).toLocaleDateString('pt-BR')}</p></div>{typeof outfit.score === 'number' ? <div className="look-detail-score"><small>Pontuação do motor</small><strong>{Math.round(outfit.score * 100)}<span>%</span></strong></div> : null}</div>
      <p className="look-detail-explanation">{outfit.explanation || 'Uma combinação criada a partir das peças ativas do seu closet.'}</p>
      <div className="look-detail-pieces">{items.map((relation, index) => <div className="look-detail-piece" key={relation.clothing_item_id}><span>0{index + 1}</span><div><small>{clothingCategoryLabel(relation.clothing_items?.category || relation.role)}</small><strong>{relation.clothing_items?.name || 'Peça registrada'}</strong></div><b>{relation.clothing_items?.colors?.[0]?.name || 'cor a confirmar'}</b></div>)}</div>
      <LookActions outfitId={outfit.id} initialFeedback={feedback?.kind || null} initialUsed={Boolean(history)} />
      <Link className="app-outline-button look-detail-back-action" href="/app/looks/criar">Criar outra combinação <span aria-hidden="true">↗</span></Link>
    </section>
  </div>
}
