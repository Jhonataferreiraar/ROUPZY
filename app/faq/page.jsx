import { SiteFrame } from '@/components/site-frame'
import { getPublicContent } from '@/lib/config/public-content'

export const revalidate = 60

export const metadata = {
  title: 'Perguntas frequentes | Roupzy',
  description: 'Respostas sobre o Roupzy, privacidade, recomendações e planos.'
}

export default async function FAQPage() {
  const { faq } = await getPublicContent()
  return (
    <SiteFrame>
      <section className="simple-page-hero shell"><span className="section-kicker">FAQ</span><h1>Respostas claras<br />{' '}<em>antes de começar.</em></h1><p>Se sua dúvida não estiver aqui, fale com a gente pelo canal que será divulgado na abertura do Roupzy.</p></section>
      <section className="faq-list shell">{faq.map(({ question, answer }, index) => <details className="faq-item" key={question} open={index === 0}><summary><span>{String(index + 1).padStart(2, '0')}</span><strong>{question}</strong><b aria-hidden="true">+</b></summary><p>{answer}</p></details>)}</section>
    </SiteFrame>
  )
}
