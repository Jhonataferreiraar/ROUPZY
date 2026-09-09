import { NextResponse } from 'next/server'
import { z } from 'zod'

import { matchInspiration, type InspirationMatchPiece, type InspirationTarget } from '@/domain/inspiration/matcher'
import { DomainError } from '@/domain/shared/errors'
import { getAuthContext } from '@/lib/auth/server'
import { assertSameOrigin, safeJsonError } from '@/lib/security/request'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request)
    const { supabase, user } = await getAuthContext()
    const id = z.string().uuid().parse((await params).id)
    const { data: inspiration, error: inspirationError } = await supabase.from('inspirations').select('id, analysis_status, attributes').eq('id', id).eq('owner_id', user.id).is('deleted_at', null).maybeSingle()
    if (inspirationError) throw new DomainError('dependency_unavailable', 'Não foi possível carregar essa referência.')
    if (!inspiration) throw new DomainError('not_found', 'Referência não encontrada.')
    if (inspiration.analysis_status !== 'ready') throw new DomainError('validation', 'Analise a referência antes de buscar peças parecidas.')
    const { data: pieces, error: piecesError } = await supabase.from('clothing_items').select('id, name, category, colors, formality').eq('owner_id', user.id).eq('availability', 'active').is('deleted_at', null)
    if (piecesError) throw new DomainError('dependency_unavailable', 'Não foi possível consultar seu closet.')
    const target = inspiration.attributes as InspirationTarget
    const matches = matchInspiration(target, (pieces || []) as InspirationMatchPiece[])
    await supabase.from('inspiration_matches').delete().eq('inspiration_id', id).eq('owner_id', user.id)
    if (matches.length) {
      const { error: insertError } = await supabase.from('inspiration_matches').insert(matches.map((match) => ({ owner_id: user.id, inspiration_id: id, clothing_item_id: match.clothingItemId, match_type: match.matchType, score: match.score, explanation: match.explanation, engine_version: 'inspiration-matcher-2026-09-07' })))
      if (insertError) throw new DomainError('dependency_unavailable', 'Não foi possível guardar as correspondências.')
    }
    return NextResponse.json({ matches })
  } catch (error) {
    return safeJsonError(error)
  }
}
