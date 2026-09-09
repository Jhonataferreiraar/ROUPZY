import { redirect } from 'next/navigation'

import { AppShell } from '@/components/app-shell'
import { getAuthContext } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Painel pessoal | Roupzy',
  robots: { index: false, follow: false }
}

export default async function AppLayout({ children }) {
  const context = await getAuthContext().catch(() => null)
  if (!context) redirect('/login')
  return <AppShell profile={context.profile}>{children}</AppShell>
}
