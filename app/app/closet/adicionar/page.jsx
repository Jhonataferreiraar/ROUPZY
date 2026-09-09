import Link from 'next/link'

import { ClosetManager } from '@/components/closet-manager'
import { getAuthContext } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

export default async function AddClosetItemPage() {
  await getAuthContext()
  return (
    <div className="app-page shell app-narrow-page closet-add-page">
      <div className="app-page-intro"><div><span className="app-kicker">ROUPZY / NOVA PEÇA</span><h1>Coloque mais<br />{' '}<em>uma possibilidade.</em></h1><p>Registre uma peça com os dados que você já sabe. Se enviar uma foto, a análise ajuda a organizar o restante.</p></div><Link className="app-outline-button" href="/app/closet">Voltar ao closet <span aria-hidden="true">↗</span></Link></div>
      <ClosetManager addOnly />
    </div>
  )
}
