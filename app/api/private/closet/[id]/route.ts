import { NextResponse } from 'next/server'
import { z } from 'zod'

import { clothingUpdateSchema } from '@/domain/clothing/schema'
import { DomainError } from '@/domain/shared/errors'
import { getAuthContext } from '@/lib/auth/server'
import { assertSameOrigin, safeJsonError } from '@/lib/security/request'

const idSchema = z.string().uuid()

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request)
    const { supabase, user } = await getAuthContext()
    const id = idSchema.parse((await params).id)
    const input = clothingUpdateSchema.parse(await request.json())
    const update = {
      ...(input.name === undefined ? {} : { name: input.name }),
      ...(input.category === undefined ? {} : { category: input.category }),
      ...(input.subcategory === undefined ? {} : { subcategory: input.subcategory }),
      ...(input.colors === undefined ? {} : { colors: input.colors }),
      ...(input.pattern === undefined ? {} : { pattern: input.pattern }),
      ...(input.material === undefined ? {} : { material: input.material }),
      ...(input.fit === undefined ? {} : { fit: input.fit }),
      ...(input.formality === undefined ? {} : { formality: input.formality }),
      ...(input.seasons === undefined ? {} : { seasons: input.seasons }),
      ...(input.weatherRange === undefined ? {} : { weather_range: input.weatherRange }),
      ...(input.notes === undefined ? {} : { notes: input.notes }),
      ...(input.availability === undefined ? {} : { availability: input.availability })
    }
    const { data, error } = await supabase.from('clothing_items').update(update).eq('id', id).eq('owner_id', user.id).is('deleted_at', null).select('id, asset_id, name, category, subcategory, colors, pattern, material, fit, formality, seasons, weather_range, availability, analysis_status, notes, created_at, updated_at').maybeSingle()
    if (error) throw new DomainError('dependency_unavailable', 'Não foi possível atualizar essa peça.')
    if (!data) throw new DomainError('not_found', 'Peça não encontrada.')
    return NextResponse.json({ item: data })
  } catch (error) {
    return safeJsonError(error)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request)
    const { supabase, user } = await getAuthContext()
    const id = idSchema.parse((await params).id)
    const { data, error } = await supabase.from('clothing_items').update({ deleted_at: new Date().toISOString(), availability: 'archived' }).eq('id', id).eq('owner_id', user.id).is('deleted_at', null).select('id').maybeSingle()
    if (error) throw new DomainError('dependency_unavailable', 'Não foi possível arquivar essa peça.')
    if (!data) throw new DomainError('not_found', 'Peça não encontrada.')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return safeJsonError(error)
  }
}
