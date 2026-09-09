import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

import { DomainError } from '@/domain/shared/errors'
import { getServerEnv } from '@/lib/config/env'

export type BillingCheckoutInput = {
  ownerId: string
  planCode: string
  returnUrl: string
}

export interface BillingProvider {
  createCheckout(input: BillingCheckoutInput): Promise<{ checkoutUrl: string; externalReference: string }>
  cancelSubscription(externalSubscriptionId: string): Promise<void>
}

export class UnavailableBillingProvider implements BillingProvider {
  async createCheckout(_input: BillingCheckoutInput): Promise<{ checkoutUrl: string; externalReference: string }> {
    throw new DomainError('dependency_unavailable', 'O checkout ainda não está configurado.')
  }

  async cancelSubscription(_externalSubscriptionId: string): Promise<void> {
    throw new DomainError('dependency_unavailable', 'A cobrança ainda não está configurada.')
  }
}

export function getBillingProvider() {
  const env = getServerEnv()
  if (!env.BILLING_PROVIDER) return new UnavailableBillingProvider()
  throw new DomainError('dependency_unavailable', 'O adaptador de cobrança configurado ainda precisa ser conectado.')
}

export function verifyBillingSignature(body: string, signature: string | null, secret: string) {
  if (!signature) return false
  const expected = createHmac('sha256', secret).update(body).digest('hex')
  const received = signature.replace(/^sha256=/, '')
  const expectedBytes = Buffer.from(expected)
  const receivedBytes = Buffer.from(received)
  return expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes)
}
