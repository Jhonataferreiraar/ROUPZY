import Link from 'next/link'

import { LookGenerator } from '@/components/look-generator'

export const dynamic = 'force-dynamic'

export default function CreateLooksPage() {
  return (
    <div className="app-page shell">
      <div className="app-page-intro"><div><span className="app-kicker">ROUPZY / NOVA COMBINAÇÃO</span><h1>Deixe o dia<br />{' '}<em>dar o tom.</em></h1><p>O motor determinístico cruza ocasião, vibe e as peças ativas do seu closet. A decisão continua sendo sua.</p></div><Link className="app-outline-button" href="/app/closet">Ver meu closet <span>↗</span></Link></div>
      <LookGenerator />
    </div>
  )
}
