import Link from 'next/link'

import { ContactForm } from '@/components/contact-form'
import { SiteFrame } from '@/components/site-frame'

export const metadata = {
  title: 'Contato | Roupzy',
  description: 'Entre em contato com a equipe Roupzy.'
}

export default function ContactPage() {
  return (
    <SiteFrame>
      <section className="contact-page shell"><div className="contact-copy"><span className="section-kicker">CONTATO</span><h1>Vamos conversar<br />{' '}<em>sobre o seu jeito.</em></h1><p>Uma dúvida, uma parceria ou uma ideia para o produto? Escreva para a equipe Roupzy.</p><Link className="rz-quiet-link" href="/faq">Ver perguntas frequentes <span aria-hidden="true">↗</span></Link></div><div className="contact-card"><span className="contact-card-mark">R</span><strong>Um armário cheio<br />{' '}também pode ser<br />{' '}um ponto de partida.</strong><span>ROUPZY / relações com a comunidade</span></div></section>
      <section className="contact-form-section shell"><div><span className="section-kicker">MENSAGEM</span><h2>Fale com<br />{' '}<em>a gente.</em></h2></div><ContactForm /></section>
    </SiteFrame>
  )
}
