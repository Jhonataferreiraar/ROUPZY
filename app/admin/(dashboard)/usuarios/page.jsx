import { AdminUsers } from '@/components/admin-users'
import { getAdminUsersData } from '@/lib/admin/users-data'
import { requireAdmin } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Usuários | Roupzy',
  robots: { index: false, follow: false }
}

export default async function AdminUsersPage() {
  const { role } = await requireAdmin()
  let initialData = null
  try {
    initialData = await getAdminUsersData('', 1)
  } catch {
    initialData = null
  }
  return <section className="admin-section-page"><div className="admin-section-page-intro"><div><span className="admin-topbar-kicker">Contas e acesso</span><h2>Usuários</h2><p>Consulte as contas, acompanhe a ativação e controle os acessos administrativos.</p></div><span className="admin-section-page-index">01</span></div><AdminUsers canManage={role !== 'support'} canManageRoles={role === 'owner'} initialData={initialData} /></section>
}
