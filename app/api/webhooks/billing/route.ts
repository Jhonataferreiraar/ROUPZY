import { createHash } from 'node:crypto'

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { DomainError } from '@/domain/shared/errors'
import { verifyBillingSignature } from '@/lib/billing/provider'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getServerEnv } from '@/lib/config/env'
import { safeJsonError } from '@/lib/security/request'

const eventSchema = z.object({
  id: z.string().min(1).max(200),
  type: z.string().min(1).max(160)
}).passthrough()

export async function POST(request: Request) {
  try {
    const env = getServerEnv()
    if (!env.BILLING_PROVIDER || !env.BILLING_WEBHOOK_SECRET) {
      throw new DomainError('dependency_unavailable', 'Webhook de billing ainda não está configurado.')
    }
    const body = await request.text()
    const signature = request.headers.get('x-billing-signature')
    if (!verifyBillingSignature(body, signature, env.BILLING_WEBHOOK_SECRET)) {
      return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 401 })
    }
    const event = eventSchema.parse(JSON.parse(body))
    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.from('webhook_events').insert({
      provider: env.BILLING_PROVIDER,
      external_event_id: event.id,
      signature_verified: true,
      headers: {
        'content-type': request.headers.get('content-type'),
        'user-agent': request.headers.get('user-agent')
      },
      body_hash: createHash('sha256').update(body).digest('hex'),
      status: 'received'
    })
    if (error?.code === '23505') return NextResponse.json({ ok: true, duplicate: true })
    if (error) throw new DomainError('dependency_unavailable', 'Não foi possível registrar o webhook.')
    return NextResponse.json({ ok: true, received: event.type }, { status: 202 })
  } catch (error) {
    return safeJsonError(error)
  }
}
