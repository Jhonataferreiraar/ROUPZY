import Image from 'next/image'
import Link from 'next/link'
import { SiteFrame } from '@/components/site-frame'

export const metadata = {
  title: 'Como funciona | Roupzy',
  description: 'Entenda como o Roupzy transforma as peças do seu armário em possibilidades para vestir.'
}

const steps = [
  ['01', 'Fotografe o que já é seu', 'Comece registrando suas peças aos poucos. Uma foto já abre espaço para uma visão mais clara do armário.'],
  ['02', 'Dê contexto às peças', 'Revise as informações sugeridas, conte como você gosta de usar cada item e deixe o seu repertório mais fiel.'],
  ['03', 'Escolha o seu momento', 'Trabalho, encontro ou um dia comum. A ocasião e a vibe ajudam a encontrar combinações possíveis para hoje.']
]

export default function HowItWorksPage() {
  return (
    <SiteFrame>
      <section className="inner-hero shell how-hero">
        <div className="inner-hero-copy">
          <span className="section-kicker">COMO FUNCIONA</span>
          <h1>Seu armário,<br />{' '}<em>em movimento.</em></h1>
          <p>O Roupzy organiza o que você já tem e transforma cada escolha em uma oportunidade de vestir de um jeito novo.</p>
          <Link className="rz-button" href="/cadastro">Começar meu closet <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="inner-hero-image"><Image src="/images/dentro-wardrobe-system.png" alt="Ilustração tecnológica de um guarda-roupa com peças organizadas" fill priority sizes="(max-width: 760px) 100vw, 50vw" /></div>
      </section>

      <section className="process-section shell" aria-labelledby="process-title">
        <div className="section-intro-row"><span className="section-kicker">O CAMINHO</span><span className="heading-rule" /></div>
        <h2 className="sr-only" id="process-title">O caminho do Roupzy</h2>
        <div className="process-grid">
          {steps.map(([number, title, description]) => (
            <article className="process-step" key={number}>
              <span>{number}</span>
              <h2>{title}</h2>
              <p>{description}</p>
              <small>passo {number}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="brand-statement"><div className="shell statement-grid"><span className="section-kicker">TECNOLOGIA NO LUGAR CERTO</span><h2>A sugestão abre caminhos. A escolha continua sendo sua.</h2><p>A proposta do Roupzy é usar inteligência para organizar possibilidades a partir do seu closet, sem impor um jeito certo de se vestir.</p></div></section>

      <section className="about-cta shell"><div><span className="section-kicker">COMECE PELO SEU ARMÁRIO</span><h2>O próximo look pode estar em uma peça que você já conhece.</h2></div><Link className="rz-button" href="/cadastro">Criar meu espaço <span aria-hidden="true">↗</span></Link></section>
    </SiteFrame>
  )
}
