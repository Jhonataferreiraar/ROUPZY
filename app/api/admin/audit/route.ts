import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getAdminAuditData } from '@/lib/admin/audit-data'
import { requireAdmin } from '@/lib/auth/server'
import { safeJsonError } from '@/lib/security/request'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(100),
  outcome: z.enum(['success', 'denied', 'failed']).optional(),
  resourceType: z.string().trim().max(80).optional()
}).strict()

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const params = new URL(request.url).searchParams
    const input = querySchema.parse({
      limit: params.get('limit') || undefined,
      outcome: params.get('outcome') || undefined,
      resourceType: params.get('resourceType') || undefined
    })
    return NextResponse.json(await getAdminAuditData(input))
  } catch (error) {
    return safeJsonError(error)
  }
}
