import Link from 'next/link'
import { SiteFrame } from '@/components/site-frame'

const resources = [
  ['01', 'Closet digital', 'Registre suas peças, confirme os atributos e consulte seu armário por categoria, cor ou ocasião.'],
  ['02', 'Recomendações pessoais', 'Escolha o momento e receba combinações construídas a partir do que realmente está disponível para você.'],
  ['03', 'Histórico de uso', 'Salve favoritos, marque o que vestiu e construa uma leitura mais honesta do seu estilo.'],
  ['04', 'Inspiração com contexto', 'Use uma referência externa para descobrir caminhos com as peças que já estão no seu closet.']
]

export const metadata = {
  title: 'Recursos | Roupzy',
  description: 'Conheça os recursos do Roupzy para organizar seu closet e vestir com mais clareza.'
}

export default function ResourcesPage() {
  return (
    <SiteFrame>
      <section className="simple-page-hero shell"><span className="section-kicker">RECURSOS</span><h1>Uma nova forma de<br />{' '}<em>olhar para o armário.</em></h1><p>O Roupzy reúne organização, análise e recomendação em um site feito para acompanhar a sua vida real.</p></section>
      <section className="resource-list shell" aria-labelledby="resource-title"><h2 className="sr-only" id="resource-title">Recursos do Roupzy</h2>{resources.map(([number, title, description]) => <article className="resource-row" key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p><span className="resource-arrow" aria-hidden="true">↗</span></article>)}</section>
      <section className="resource-note shell"><div><span className="section-kicker">O PRINCÍPIO</span><h2>O site não escolhe por você. Ele deixa a escolha mais fácil de enxergar.</h2></div><Link className="rz-button" href="/sobre">Conhecer o Roupzy <span aria-hidden="true">↗</span></Link></section>
    </SiteFrame>
  )
}
