import { AdminSettingsPanel } from '@/components/admin-control-panel'
import { getAdminControlData } from '@/lib/admin/control-data'
import { requireAdmin } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Configurações | Roupzy',
  robots: { index: false, follow: false }
}

export default async function AdminSettingsPage() {
  const { role } = await requireAdmin()
  let initialData = null
  try {
    initialData = await getAdminControlData('settings')
  } catch {
    initialData = null
  }
  return <section className="admin-section-page"><div className="admin-section-page-intro"><div><span className="admin-topbar-kicker">Operação do produto</span><h2>Configurações</h2><p>Gerencie flags e parâmetros globais que alteram o comportamento do produto.</p></div><span className="admin-section-page-index">06</span></div><AdminSettingsPanel canManage={role !== 'support'} initialData={initialData} /></section>
}
