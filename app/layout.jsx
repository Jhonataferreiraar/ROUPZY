import './globals.css'
import './reference-landing.css'
import './roupzy.css'
import './roupzy-redesign.css'
import './roupzy-v3.css'
import './roupzy-v4.css'
import './roupzy-impeccable.css'
import './roupzy-tech.css'

import { MotionOrchestrator } from '@/components/motion-orchestrator'

export const metadata = {
  title: 'Roupzy — Seu armário. Seu próximo look.',
  description: 'Descubra o que vestir usando as roupas que você já tem.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/brand/favicon.svg'
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="rf-system ri-system"><MotionOrchestrator />{children}</body>
    </html>
  )
}
