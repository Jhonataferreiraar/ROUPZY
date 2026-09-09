import Link from 'next/link'

import { RoupzyLab } from '@/components/roupzy-lab'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getPublicContent } from '@/lib/config/public-content'

export const revalidate = 60

const method = [
  { verb: 'Fotografe', note: 'Uma peça por vez', text: 'Envie uma foto simples. O Roupzy prepara a peça para entrar no seu acervo privado.' },
  { verb: 'Confirme', note: 'Você tem a palavra final', text: 'Categoria, cor, tecido e ocasião aparecem organizados para você revisar sem esforço.' },
  { verb: 'Vista', note: 'Três caminhos reais', text: 'Escolha o momento e receba combinações feitas somente com o que está disponível no seu closet.' }
]

const capabilities = [
  ['Closet vivo', 'Encontre cada peça por cor, categoria, estação ou situação de uso.'],
  ['Looks com contexto', 'Ocasião, clima e preferência mudam a leitura do mesmo armário.'],
  ['Memória de uso', 'Favoritos, histórico e repetições mostram o que realmente funciona.'],
  ['Inspiração possível', 'Uma referência externa vira um caminho com as peças que você já possui.']
]

export default async function HomePage() {
  const content = await getPublicContent()

  return (
    <main className="rv-public" id="top">
      <SiteHeader home />

      <section className="rv-hero" aria-labelledby="rv-hero-title">
        <div className="rv-shell rv-hero-grid">
          <div className="rv-hero-copy">
            <p className="rv-kicker"><span /> Seu armário, finalmente visível</p>
            <h1 id="rv-hero-title">{content.home.heroTitle} <em>{content.home.heroHighlight}</em></h1>
            <p className="rv-hero-lead">{content.home.heroDescription}</p>
            <div className="rv-actions">
              <Link className="rv-button rv-button-primary" href="/cadastro">{content.home.heroCta}<span aria-hidden="true">↗</span></Link>
              <a className="rv-button rv-button-quiet" href="#como-funciona">Conhecer o método<span aria-hidden="true">↓</span></a>
            </div>
            <div className="rv-trust-line" aria-label="Princípios do produto">
              <span>Imagens privadas</span><span>Escolhas confirmadas por você</span><span>Somente peças reais</span>
            </div>
          </div>

          <div className="rv-wardrobe-map" aria-label="Representação do acervo pessoal Roupzy">
            <div className="rv-map-top"><span>ACERVO PESSOAL</span><span><i /> atualizado agora</span></div>
            <div className="rv-map-rail" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="rv-garment rv-garment-shirt"><span>Camisa</span><strong>linho azul</strong><small>trabalho · meia-estação</small></div>
            <div className="rv-garment rv-garment-trouser"><span>Calça</span><strong>alfaiataria</strong><small>neutra · disponível</small></div>
            <div className="rv-garment rv-garment-shoe"><span>Sapato</span><strong>couro claro</strong><small>casual · disponível</small></div>
            <div className="rv-map-context"><small>LEITURA PARA HOJE</small><strong>leve, arrumado<br />{' '}e sem excesso.</strong><Link href="/cadastro">Criar meu espaço <span aria-hidden="true">↗</span></Link></div>
            <div className="rv-map-count"><strong>03</strong><span>peças<br />{' '}deste look</span></div>
          </div>
        </div>
        <div className="rv-shell rv-hero-foot"><span>Roupzy transforma inventário em repertório.</span><span aria-hidden="true" /><span>Você continua escolhendo.</span></div>
      </section>

      <section className="rv-manifest" id="produto" aria-labelledby="rv-manifest-title">
        <div className="rv-shell rv-manifest-grid">
          <p className="rv-kicker">O ponto de partida</p>
          <h2 id="rv-manifest-title">Seu closet não precisa de mais coisas. Precisa de <em>clareza.</em></h2>
          <p>O Roupzy organiza as peças que já fazem parte da sua vida e transforma cada escolha em contexto. Menos procura. Mais combinações que parecem suas.</p>
        </div>
      </section>

      <section className="rv-method" id="como-funciona" aria-labelledby="rv-method-title">
        <div className="rv-shell">
          <header className="rv-section-head"><div><p className="rv-kicker">Da foto ao look</p><h2 id="rv-method-title">Um fluxo curto.<br />{' '}<em>Um armário mais inteligente.</em></h2></div><p>A tecnologia organiza os bastidores para que a experiência continue simples e pessoal.</p></header>
          <div className="rv-method-list">
            {method.map((item, index) => (
              <article key={item.verb}>
                <span className="rv-method-index">{String(index + 1).padStart(2, '0')}</span>
                <div><small>{item.note}</small><h3>{item.verb}</h3></div>
                <p>{item.text}</p>
                <span className="rv-method-signal" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rv-product" id="possibilidades" aria-labelledby="rv-product-title">
        <div className="rv-shell">
          <header className="rv-section-head rv-section-head-light"><div><p className="rv-kicker">Dentro do Roupzy</p><h2 id="rv-product-title">O painel nasce do seu<br />{' '}<em>próprio repertório.</em></h2></div><p>Explore uma leitura interativa do produto e veja como o contexto muda as sugestões.</p></header>
          <div className="rv-product-stage"><aside><span>CONTEXTO</span><strong>O armário é o mesmo.</strong><p>Troque ocasião e intenção. O sistema reorganiza as possibilidades sem inventar novas peças.</p></aside><RoupzyLab /></div>
        </div>
      </section>

      <section className="rv-capabilities" aria-labelledby="rv-capabilities-title">
        <div className="rv-shell">
          <header className="rv-section-head"><div><p className="rv-kicker">Uma visão completa</p><h2 id="rv-capabilities-title">Tudo encontra<br />{' '}<em>o seu lugar.</em></h2></div><Link className="rv-button rv-button-quiet" href="/recursos">Ver todos os recursos<span aria-hidden="true">↗</span></Link></header>
          <div className="rv-capability-grid">{capabilities.map(([title, text], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </div>
      </section>

      <section className="rv-proof" aria-labelledby="rv-proof-title">
        <div className="rv-shell rv-proof-grid">
          <div><p className="rv-kicker">Feito para a vida real</p><h2 id="rv-proof-title">Repetir também é<br />{' '}<em>ter estilo.</em></h2></div>
          <blockquote>“Quero abrir o armário e enxergar possibilidades, sem sentir que preciso comprar outra coisa.”<footer>Uma necessidade que orienta o Roupzy</footer></blockquote>
          <div className="rv-proof-principles"><span><strong>100%</strong> do seu acervo</span><span><strong>0</strong> peças inventadas</span><span><strong>1</strong> escolha por vez</span></div>
        </div>
      </section>

      <section className="rv-final-cta" aria-labelledby="rv-final-title"><div className="rv-shell rv-final-grid"><span className="rv-final-mark" aria-hidden="true">R</span><div><p className="rv-kicker">Comece pelo que já existe</p><h2 id="rv-final-title">Seu próximo look<br />{' '}<em>pode estar aqui.</em></h2><p>Abra o seu espaço, registre as primeiras peças e deixe seu armário trabalhar a seu favor.</p><Link className="rv-button rv-button-primary" href="/cadastro">Criar meu closet<span aria-hidden="true">↗</span></Link></div></div></section>

      <SiteFooter />
    </main>
  )
}
