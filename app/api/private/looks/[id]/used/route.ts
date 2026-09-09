import { NextResponse } from 'next/server'
import { z } from 'zod'

import { DomainError } from '@/domain/shared/errors'
import { getAuthContext } from '@/lib/auth/server'
import { assertSameOrigin, safeJsonError } from '@/lib/security/request'

const schema = z.object({ usedOn: z.string().date().optional() }).strict()

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request)
    const { supabase, user } = await getAuthContext()
    const outfitId = z.string().uuid().parse((await params).id)
    const input = schema.parse(await request.json())
    const { data: outfit, error: outfitError } = await supabase.from('outfits').select('id').eq('id', outfitId).eq('owner_id', user.id).maybeSingle()
    if (outfitError) throw new DomainError('dependency_unavailable', 'Não foi possível localizar esse look.')
    if (!outfit) throw new DomainError('not_found', 'Look não encontrado.')
    const usedOn = input.usedOn || new Date().toISOString().slice(0, 10)
    const { data: existing, error: existingError } = await supabase.from('outfit_history').select('id').eq('owner_id', user.id).eq('outfit_id', outfitId).eq('used_on', usedOn).maybeSingle()
    if (existingError) throw new DomainError('dependency_unavailable', 'Não foi possível consultar seu histórico.')
    if (existing) return NextResponse.json({ ok: true, reused: true })
    const { error } = await supabase.from('outfit_history').insert({ owner_id: user.id, outfit_id: outfitId, used_on: usedOn, source: 'user' })
    if (error) throw new DomainError('dependency_unavailable', 'Não foi possível salvar no seu histórico.')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return safeJsonError(error)
  }
}
