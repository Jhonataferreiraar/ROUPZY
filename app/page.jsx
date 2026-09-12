import Link from 'next/link'

import { BrandMark } from '@/components/brand'
import { CurationDemo } from '@/components/curation-demo'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getPublicContent } from '@/lib/config/public-content'

export const revalidate = 60

const method = [
  { title: 'Registre', text: 'Fotografe uma peça e adicione ao seu arquivo.' },
  { title: 'Confirme', text: 'Revise a leitura automática em segundos.' },
  { title: 'Escolha', text: 'Defina o momento e encontre combinações reais.' }
]

const inventory = [
  ['Arquivo real', 'Peças que você já tem.'],
  ['Contexto', 'Um caminho para cada momento.'],
  ['Memória', 'Seus usos viram referência.'],
  ['Inspiração', 'Ideias de fora, equivalentes reais.']
]

function PieceSketch({ type }) {
  if (type === 'top') return <svg viewBox="0 0 120 140" aria-hidden="true"><path d="M37 24 12 39l13 24 12-8v57h46V55l12 8 13-24-25-15-14 11H51Z" /><path d="M51 35 60 47l9-12M60 47v65" /></svg>
  if (type === 'bottom') return <svg viewBox="0 0 120 140" aria-hidden="true"><path d="m35 18 20 4h10l20-4 4 38-14 3-5 70H50l-5-70-14-3Z" /><path d="M55 22v37M65 22v37M45 59h30" /></svg>
  return <svg viewBox="0 0 150 100" aria-hidden="true"><path d="M25 33c10 20 26 31 49 36l44 10c9 2 15 7 18 15H15c-5 0-8-4-6-9l10-20Z" /><path d="M20 78h114M46 38l-8 16m25-1-9 11m30-6-6 7" /></svg>
}

function ArchiveBoard() {
  return (
    <div className="ri-hero-board" data-motion-stage aria-label="Demonstração visual de um closet organizado pelo Roupzy">
      <div className="ri-board-top"><span><i /> arquivo em leitura</span><span>folha 001 / RZ</span></div>
      <div className="ri-board-surface">
        <div className="ri-board-rule ri-board-rule-one" aria-hidden="true" />
        <div className="ri-board-rule ri-board-rule-two" aria-hidden="true" />
        <div className="ri-board-pin ri-board-pin-blue" aria-hidden="true" />
        <div className="ri-board-pin ri-board-pin-red" aria-hidden="true" />
        <article className="ri-garment-sheet ri-garment-sheet-top"><span>PEÇA 014</span><strong>linho azul</strong><PieceSketch type="top" /><small>leve / trabalho</small></article>
        <article className="ri-garment-sheet ri-garment-sheet-bottom"><span>PEÇA 008</span><strong>calça reta</strong><PieceSketch type="bottom" /><small>base / recorrente</small></article>
        <article className="ri-garment-sheet ri-garment-sheet-shoe"><span>PEÇA 003</span><strong>couro claro</strong><PieceSketch type="shoe" /><small>casual / disponível</small></article>
        <div className="ri-board-context"><span>O DIA PEDE</span><strong>Trabalho</strong><small>leve · presente · 24°</small><i className="ri-arrow" aria-hidden="true" /></div>
        <div className="ri-board-thread ri-board-thread-a" aria-hidden="true" />
        <div className="ri-board-thread ri-board-thread-b" aria-hidden="true" />
      </div>
      <div className="ri-board-bottom"><span>3 possibilidades localizadas</span><span>baseadas no seu arquivo</span></div>
    </div>
  )
}

export default async function HomePage() {
  const content = await getPublicContent()

  return (
    <main className="ri-home" id="top">
      <SiteHeader home />

      <section className="ri-hero" aria-labelledby="ri-hero-title">
        <div className="ri-hero-measure" aria-hidden="true"><span>ROUPZY</span><i /><span>ARQUIVO / 2026</span></div>
        <div className="ri-container ri-hero-inner">
          <div className="ri-hero-copy" data-reveal>
            <div className="ri-meta-row"><span className="ri-stamp">TECNOLOGIA PARA O QUE JÁ É SEU</span><span>BRASIL / ONLINE</span></div>
            <h1 id="ri-hero-title">{content.home.heroTitle}<span>{content.home.heroHighlight}</span></h1>
            <p className="ri-hero-description">{content.home.heroDescription}</p>
            <div className="ri-hero-actions"><Link className="ri-button ri-button-primary" href="/cadastro">{content.home.heroCta}<span className="ri-arrow" aria-hidden="true" /></Link><a className="ri-button ri-button-secondary" href="#metodo">Ver como funciona<span className="ri-arrow ri-arrow-down" aria-hidden="true" /></a></div>
            <div className="ri-hero-annotation"><span><i className="ri-dot ri-dot-blue" /> somente as suas peças</span><span><i className="ri-dot ri-dot-red" /> decisão continua sua</span></div>
          </div>
          <div className="ri-hero-visual" data-reveal><ArchiveBoard /></div>
        </div>
        <div className="ri-ribbon" aria-hidden="true"><div><span>ORGANIZE O QUE JÁ EXISTE</span><i className="ri-spark" /><span>ENXERGUE NOVAS COMBINAÇÕES</span><i className="ri-spark" /><span>ORGANIZE O QUE JÁ EXISTE</span><i className="ri-spark" /><span>ENXERGUE NOVAS COMBINAÇÕES</span></div></div>
      </section>

      <section className="ri-statement" id="produto" aria-labelledby="ri-statement-title">
        <div className="ri-container ri-statement-grid" data-reveal>
          <div className="ri-section-mark"><span>RZ / PRINCÍPIO</span><i /></div>
          <h2 id="ri-statement-title">O armário cheio não precisa de mais referência. Precisa de uma <em>leitura melhor.</em></h2>
          <div className="ri-statement-note"><span className="ri-monogram"><BrandMark className="brand-mark" size={44} /></span><p>O Roupzy lê o que já é seu para abrir novas possibilidades.</p></div>
        </div>
      </section>

      <section className="ri-method" id="metodo" aria-labelledby="ri-method-title">
        <div className="ri-container">
          <div className="ri-section-heading" data-reveal><div><span className="ri-stamp">O MÉTODO ROUPZY</span><h2 id="ri-method-title">Da fotografia<br /><em>à escolha.</em></h2></div><p>Três movimentos simples organizam os bastidores para que você encontre clareza na frente.</p></div>
          <div className="ri-method-list">{method.map((item, index) => <article key={item.title} data-reveal><div className="ri-method-index"><span>{String(index + 1).padStart(2, '0')}</span><i /></div><div><h3>{item.title}</h3><p>{item.text}</p></div><span className="ri-arrow" aria-hidden="true" /></article>)}</div>
        </div>
      </section>

      <section className="ri-lab-section" id="experimente" aria-labelledby="ri-lab-title">
          <div className="ri-container"><div className="ri-section-heading ri-section-heading-dark" data-reveal><div><span className="ri-stamp">UMA DEMONSTRAÇÃO</span><h2 id="ri-lab-title">O mesmo acervo.<br /><em>Outro momento.</em></h2></div><p>Troque o contexto. Veja novas possibilidades.</p></div><div data-reveal><CurationDemo /></div></div>
      </section>

      <section className="ri-inventory" id="possibilidades" aria-labelledby="ri-inventory-title">
        <div className="ri-container"><div className="ri-section-heading" data-reveal><div><span className="ri-stamp">UM ARQUIVO VIVO</span><h2 id="ri-inventory-title">O que você tem<br /><em>começa a conversar.</em></h2></div><Link className="ri-text-action" href="/recursos">Conhecer recursos <span className="ri-arrow" aria-hidden="true" /></Link></div><div className="ri-inventory-layout"><div className="ri-inventory-visual" data-reveal><div className="ri-inventory-note"><span>CATÁLOGO PESSOAL</span><strong>ROUPAS<br />QUE<br /><em>EXISTEM.</em></strong><i className="ri-arrow" aria-hidden="true" /></div><div className="ri-inventory-stitch" aria-hidden="true" /></div><div className="ri-inventory-list">{inventory.map(([title, text], index) => <article key={title} data-reveal><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{text}</p></div><i className="ri-arrow" aria-hidden="true" /></article>)}</div></div></div>
      </section>

      <section className="ri-trust" aria-labelledby="ri-trust-title"><div className="ri-container ri-trust-layout" data-reveal><div><span className="ri-stamp">TECNOLOGIA DISCRETA</span><h2 id="ri-trust-title">O sistema observa.<br /><em>Você se reconhece.</em></h2></div><div className="ri-trust-copy"><span><i className="ri-dot ri-dot-blue" /> PRIVADO POR PRINCÍPIO</span><p>Seu armário continua seu. A decisão também.</p><Link className="ri-button ri-button-secondary" href="/privacidade">Ler sobre privacidade <span className="ri-arrow" aria-hidden="true" /></Link></div></div></section>

      <section className="ri-final-cta" aria-labelledby="ri-final-title"><div className="ri-container ri-final-grid" data-reveal><div className="ri-final-graphic" aria-hidden="true"><BrandMark className="ri-final-logo" size={96} /><i /><i /><i /></div><div><span className="ri-stamp">COMECE PELO SEU ARMÁRIO</span><h2 id="ri-final-title">O próximo look pode estar <em>mais perto</em> do que parece.</h2><p>Crie seu espaço e comece pelas suas peças.</p><Link className="ri-button ri-button-primary" href="/cadastro">Criar meu espaço <span className="ri-arrow" aria-hidden="true" /></Link></div></div></section>

      <SiteFooter />
    </main>
  )
}
