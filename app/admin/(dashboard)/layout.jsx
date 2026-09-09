import { AdminDashboardShell } from '@/components/admin-dashboard-shell'
import { DomainError } from '@/domain/shared/errors'
import { requireAdmin } from '@/lib/auth/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }) {
  let context
  try {
    context = await requireAdmin()
  } catch (error) {
    if (error instanceof DomainError && (error.code === 'unauthorized' || error.code === 'forbidden')) {
      redirect('/admin/login?erro=sem-acesso')
    }
    throw error
  }

  return <AdminDashboardShell role={context.role} email={context.user.email || ''}>{children}</AdminDashboardShell>
}
