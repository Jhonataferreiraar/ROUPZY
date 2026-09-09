import { NextResponse } from 'next/server'
import { z } from 'zod'

import { DomainError } from '@/domain/shared/errors'
import { getAuthContext } from '@/lib/auth/server'
import { assertSameOrigin, safeJsonError } from '@/lib/security/request'

const schema = z.object({
  kind: z.enum(['liked', 'rejected', 'favorited']),
  reason: z.string().trim().max(300).nullable().optional()
}).strict()

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request)
    const { supabase, user } = await getAuthContext()
    const outfitId = z.string().uuid().parse((await params).id)
    const input = schema.parse(await request.json())
    const { data: outfit, error: outfitError } = await supabase.from('outfits').select('id').eq('id', outfitId).eq('owner_id', user.id).maybeSingle()
    if (outfitError) throw new DomainError('dependency_unavailable', 'Não foi possível localizar esse look.')
    if (!outfit) throw new DomainError('not_found', 'Look não encontrado.')
    const { error } = await supabase.from('outfit_feedback').upsert({
      owner_id: user.id,
      outfit_id: outfitId,
      kind: input.kind,
      reason: input.reason || null
    }, { onConflict: 'owner_id,outfit_id' })
    if (error) throw new DomainError('dependency_unavailable', 'Não foi possível registrar sua escolha.')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return safeJsonError(error)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request)
    const { supabase, user } = await getAuthContext()
    const outfitId = z.string().uuid().parse((await params).id)
    const { data: outfit, error: outfitError } = await supabase.from('outfits').select('id').eq('id', outfitId).eq('owner_id', user.id).maybeSingle()
    if (outfitError) throw new DomainError('dependency_unavailable', 'Não foi possível localizar esse look.')
    if (!outfit) throw new DomainError('not_found', 'Look não encontrado.')
    const { error } = await supabase.from('outfit_feedback').delete().eq('owner_id', user.id).eq('outfit_id', outfitId)
    if (error) throw new DomainError('dependency_unavailable', 'Não foi possível remover este favorito.')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return safeJsonError(error)
  }
}
