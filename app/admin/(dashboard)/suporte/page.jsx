import { AdminSupportPanel } from '@/components/admin-control-panel'
import { getAdminControlData } from '@/lib/admin/control-data'
import { requireAdmin } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Suporte | Roupzy',
  robots: { index: false, follow: false }
}

export default async function AdminSupportPage() {
  const { role } = await requireAdmin()
  let initialData = null
  try {
    initialData = await getAdminControlData('support')
  } catch {
    initialData = null
  }
  return <section className="admin-section-page"><div className="admin-section-page-intro"><div><span className="admin-topbar-kicker">Relacionamento</span><h2>Suporte</h2><p>Organize contatos, feedbacks e retornos que chegam pela experiência Roupzy.</p></div><span className="admin-section-page-index">04</span></div><AdminSupportPanel canManage={role !== 'support'} initialData={initialData} /></section>
}
