import { NextResponse } from 'next/server'

import { getAdminDashboardData } from '@/lib/admin/dashboard-data'
import { requireAdmin } from '@/lib/auth/server'
import { safeJsonError } from '@/lib/security/request'

export async function GET() {
  try {
    await requireAdmin()
    return NextResponse.json(await getAdminDashboardData())
  } catch (error) {
    return safeJsonError(error)
  }
}
