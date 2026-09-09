import 'server-only'

import { createHash } from 'node:crypto'

import { DomainError } from '@/domain/shared/errors'

export function rateLimitKey(scope: string, value: string) {
  return createHash('sha256').update(scope + ':' + value.trim().toLowerCase()).digest('hex')
}

type RPCClient = {
  rpc: (name: string, args: Record<string, unknown>) => PromiseLike<{ data: boolean | null; error: unknown }>
}

export async function consumeRateLimit(supabase: unknown, key: string, limit: number, windowSeconds: number) {
  const { data, error } = await (supabase as RPCClient).rpc('consume_rate_limit', {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds
  })
  if (error) throw new DomainError('dependency_unavailable', 'Não foi possível validar o limite de segurança.')
  if (data !== true) throw new DomainError('rate_limited', 'Muitas tentativas. Aguarde alguns minutos e tente novamente.')
}
