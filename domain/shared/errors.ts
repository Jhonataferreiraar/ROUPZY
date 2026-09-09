export type DomainErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'conflict'
  | 'rate_limited'
  | 'dependency_unavailable'

export class DomainError extends Error {
  readonly code: DomainErrorCode
  readonly status: number

  constructor(code: DomainErrorCode, message: string) {
    super(message)
    this.name = 'DomainError'
    this.code = code
    this.status = {
      unauthorized: 401,
      forbidden: 403,
      not_found: 404,
      validation: 400,
      conflict: 409,
      rate_limited: 429,
      dependency_unavailable: 503
    }[code]
  }
}
