import { AdminGlobalDashboard } from '@/components/admin-global-dashboard'
import { getAdminDashboardData } from '@/lib/admin/dashboard-data'
import { requireAdmin } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Visão geral | Roupzy',
  robots: { index: false, follow: false }
}

export default async function AdminPage() {
  const { role, user } = await requireAdmin()
  let initialData = null
  try {
    initialData = await getAdminDashboardData()
  } catch {
    initialData = null
  }
  return <AdminGlobalDashboard role={role} email={user.email || ''} initialData={initialData} />
}
