import { InspirationManager } from '@/components/inspiration-manager'

export const dynamic = 'force-dynamic'

export default function InspirationPage() {
  return (
    <div className="app-page shell app-narrow-page"><div className="app-page-intro"><div><span className="app-kicker">ROUPZY / INSPIRAÇÃO</span><h1>Trazer para<br />{' '}<em>o seu espaço.</em></h1><p>Salve referências, entenda o que chama sua atenção e encontre peças do seu próprio closet que seguem a mesma direção.</p></div></div><InspirationManager /></div>
  )
}
