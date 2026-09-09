import { AdminAuditPanel } from '@/components/admin-audit-panel'
import { getAdminAuditData } from '@/lib/admin/audit-data'
import { requireAdmin } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Auditoria | Roupzy',
  robots: { index: false, follow: false }
}

export default async function AdminAuditPage() {
  await requireAdmin()
  let initialData = null
  try {
    initialData = await getAdminAuditData({ limit: 200 })
  } catch {
    initialData = null
  }
  return <section className="admin-section-page"><div className="admin-section-page-intro"><div><span className="admin-topbar-kicker">Segurança e operação</span><h2>Auditoria</h2><p>O histórico completo das ações administrativas e dos eventos sensíveis do sistema.</p></div><span className="admin-section-page-index">05</span></div><AdminAuditPanel initialData={initialData?.logs || null} /></section>
}
