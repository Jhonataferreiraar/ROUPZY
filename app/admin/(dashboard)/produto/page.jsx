import { AdminControlPanel } from '@/components/admin-control-panel'
import { getAdminControlData } from '@/lib/admin/control-data'
import { requireAdmin } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Produto e planos | Roupzy',
  robots: { index: false, follow: false }
}

export default async function AdminProductPage() {
  const { role } = await requireAdmin()
  let initialData = null
  try {
    initialData = await getAdminControlData('product')
  } catch {
    initialData = null
  }
  return <section className="admin-section-page"><div className="admin-section-page-intro"><div><span className="admin-topbar-kicker">Monetização</span><h2>Produto e planos</h2><p>Cadastre ofertas, ajuste limites e organize o catálogo de planos do Roupzy.</p></div><span className="admin-section-page-index">02</span></div><AdminControlPanel canManage={role !== 'support'} initialData={initialData} /></section>
}
