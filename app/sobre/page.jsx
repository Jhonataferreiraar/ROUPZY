import Image from 'next/image'
import Link from 'next/link'
import { SiteFrame } from '@/components/site-frame'

export const metadata = {
  title: 'A empresa | Roupzy',
  description: 'Conheça a visão do Roupzy para tornar o vestir mais simples, pessoal e consciente.'
}

export default function AboutPage() {
  return (
    <SiteFrame>
      <section className="inner-hero shell">
        <div className="inner-hero-copy"><span className="section-kicker">A EMPRESA</span><h1>Mais clareza para o que já faz parte da sua vida.</h1><p>O Roupzy existe para ajudar cada pessoa a enxergar novas possibilidades no próprio armário, com tecnologia trabalhando nos bastidores e escolhas continuando nas suas mãos.</p></div>
        <div className="inner-hero-image"><Image src="/images/dentro-wardrobe-system.png" alt="Ilustração tecnológica de um guarda-roupa com peças organizadas" fill priority sizes="(max-width: 760px) 100vw, 50vw" /></div>
      </section>
      <section className="brand-statement"><div className="shell statement-grid"><span className="section-kicker">NOSSO PONTO DE VISTA</span><h2>O armário cheio nunca foi o problema.</h2><p>Quando as referências vêm de fora, é fácil esquecer o que já está perto. O Roupzy começa pelo inventário real de cada pessoa e transforma informação em contexto para vestir.</p></div></section>
      <section className="principles-section shell"><div className="section-intro-row"><span className="section-kicker">COMO CONSTRUÍMOS</span><span className="heading-rule" /></div><div className="principles-grid"><article><span>01</span><h3>Clareza antes de excesso</h3><p>Organizamos a informação para você decidir com menos ruído e mais intenção.</p></article><article><span>02</span><h3>Tecnologia no lugar certo</h3><p>A inteligência sugere e aprende com suas escolhas. A decisão continua sendo sua.</p></article><article><span>03</span><h3>Privacidade desde o início</h3><p>Suas peças, imagens e preferências pertencem ao seu espaço pessoal.</p></article></div></section>
      <section className="about-cta shell"><div><span className="section-kicker">PARA COMEÇAR</span><h2>Seu estilo merece um lugar para aparecer.</h2></div><Link className="rz-button" href="/cadastro">Criar meu espaço <span aria-hidden="true">↗</span></Link></section>
    </SiteFrame>
  )
}
