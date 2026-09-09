import { NotificationsPanel } from '@/components/notifications-panel'
import { getAuthContext } from '@/lib/auth/server'
import { requireSupabaseResult } from '@/lib/supabase/result'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const { supabase, user } = await getAuthContext()
  const notifications = requireSupabaseResult(await supabase.from('notifications').select('id, kind, title, body, metadata, read_at, created_at').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(50), 'Não foi possível carregar suas notificações.')
  return <div className="app-page shell app-narrow-page">
    <div className="app-page-intro"><div><span className="app-kicker">ROUPZY / NOTIFICAÇÕES</span><h1>O que importa,<br />{' '}<em>mais perto.</em></h1><p>Acompanhe avisos e atualizações ligados ao seu espaço pessoal.</p></div></div>
    <NotificationsPanel initialNotifications={notifications || []} />
  </div>
}
