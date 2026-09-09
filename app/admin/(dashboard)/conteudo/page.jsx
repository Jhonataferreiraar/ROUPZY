import { AdminContentPanel } from '@/components/admin-content-panel'
import { getAdminControlData } from '@/lib/admin/control-data'
import { requireAdmin } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Conteúdo do site | Roupzy',
  robots: { index: false, follow: false }
}

export default async function AdminContentPage() {
  const { role } = await requireAdmin()
  let initialData = null
  try {
    initialData = await getAdminControlData('settings')
  } catch {
    initialData = null
  }
  return <section className="admin-section-page"><div className="admin-section-page-intro"><div><span className="admin-topbar-kicker">Comunicação</span><h2>Conteúdo do site</h2><p>Publique a chamada da home e mantenha o FAQ atualizado sem abrir o código.</p></div><span className="admin-section-page-index">03</span></div><AdminContentPanel canManage={role !== 'support'} initialData={initialData} /></section>
}
