import { NextResponse } from 'next/server'

import { DomainError } from '@/domain/shared/errors'

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) {
    throw new DomainError('forbidden', 'A origem da requisição não pôde ser validada.')
  }
  const expected = new URL(request.url).origin
  if (origin !== expected) {
    throw new DomainError('forbidden', 'Origem da requisição não permitida.')
  }
}

export function safeJsonError(error: unknown) {
  if (error instanceof DomainError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status })
  }
  console.error('[request-error]', error)
  return NextResponse.json({ error: 'Não foi possível concluir essa ação.' }, { status: 500 })
}
