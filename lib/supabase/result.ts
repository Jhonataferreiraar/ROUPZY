import 'server-only'

import { DomainError } from '@/domain/shared/errors'

export function requireSupabaseResult<T>(result: { data: T; error: unknown }, message: string) {
  if (result.error) throw new DomainError('dependency_unavailable', message)
  return result.data
}
