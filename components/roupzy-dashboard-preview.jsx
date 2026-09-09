'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const navigation = [
  ['overview', 'Visão geral'],
  ['closet', 'Meu closet'],
  ['looks', 'Looks'],
  ['inspiration', 'Inspiração']
]

const closetItems = [
  ['Camisa de linho', 'base clara', 'rq-preview-garment-linen'],
  ['Calça reta', 'alfaiataria', 'rq-preview-garment-navy'],
  ['Tênis baixo', 'uso frequente', 'rq-preview-garment-coral'],
  ['Saia midi', 'ponto de cor', 'rq-preview-garment-pink']
]

function OverviewView() {
  return <>
    <div className="rq-preview-heading"><div><span>hoje, no seu espaço</span><h3>Seu armário está em movimento.</h3></div><Link href="/cadastro" className="rq-preview-circle" aria-label="Abrir atividade">↗</Link></div>
    <div className="rq-preview-metrics"><div><span>PEÇAS ATIVAS</span><strong>28</strong><small>no seu closet</small></div><div><span>CAMINHOS HOJE</span><strong>03</strong><small>para escolher</small></div><div><span>FAVORITOS</span><strong>06</strong><small>para repetir</small></div></div>
    <div className="rq-preview-recommendation"><div className="rq-preview-recommendation-copy"><span>UMA IDEIA POSSÍVEL</span><h4>Encontro<br />{' '}<em>sem esforço.</em></h4><p>Três peças do seu arquivo conversam com o seu momento.</p><Link href="/cadastro" className="rq-preview-action">Ver combinação <span aria-hidden="true">↗</span></Link></div><div className="rq-preview-look" aria-hidden="true"><i className="rq-preview-look-back" /><i className="rq-preview-look-top" /><i className="rq-preview-look-bottom" /><i className="rq-preview-look-shoe" /></div></div>
    <div className="rq-preview-footer-row"><span>ÚLTIMA LEITURA</span><strong>Camisa de linho · leve · versátil</strong><b aria-hidden="true">02 min</b></div>
  </>
}

function ClosetView() {
  const [filter, setFilter] = useState('all')
  const visibleItems = filter === 'all' ? closetItems : closetItems.filter((_, index) => filter === 'top' ? index === 0 || index === 3 : filter === 'bottom' ? index === 1 : index === 2)
  return <>
    <div className="rq-preview-heading"><div><span>ARQUIVO DE PEÇAS</span><h3>Seu closet, organizado.</h3></div><Link href="/cadastro" className="rq-preview-circle" aria-label="Adicionar peça">+</Link></div>
    <div className="rq-preview-filter-row"><span>28 peças</span><button type="button" className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>Todas</button><button type="button" className={filter === 'top' ? 'is-active' : ''} onClick={() => setFilter('top')}>Partes de cima</button><button type="button" className={filter === 'bottom' ? 'is-active' : ''} onClick={() => setFilter('bottom')}>Partes de baixo</button><button type="button" className={filter === 'shoe' ? 'is-active' : ''} onClick={() => setFilter('shoe')}>Calçados</button></div>
    <div className="rq-preview-closet-grid">{visibleItems.map(([name, detail, garment]) => <div className="rq-preview-closet-item" key={name}><div className={'rq-preview-garment ' + garment} aria-hidden="true" /><strong>{name}</strong><small>{detail}</small></div>)}</div>
    <div className="rq-preview-footer-row"><span>ORGANIZAÇÃO</span><strong>4 categorias · 28 peças prontas para combinar</strong><b aria-hidden="true">↗</b></div>
  </>
}

function LooksView() {
  return <>
    <div className="rq-preview-heading"><div><span>HISTÓRICO DE COMBINAÇÕES</span><h3>Looks que fazem sentido.</h3></div><Link href="/cadastro" className="rq-preview-circle" aria-label="Criar look">+</Link></div>
    <div className="rq-preview-look-list"><Link href="/cadastro"><span>01 · ENCONTRO</span><strong>Uma cor que aproxima.</strong><small>camisa de linho · saia midi · tênis baixo</small><b aria-hidden="true">↗</b></Link><Link href="/cadastro"><span>02 · TRABALHO</span><strong>Presença sem esforço.</strong><small>calça reta · camisa clara · sapato base</small><b aria-hidden="true">↗</b></Link><Link href="/cadastro"><span>03 · FIM DE SEMANA</span><strong>Leve, com intenção.</strong><small>peças frequentes do seu arquivo</small><b aria-hidden="true">↗</b></Link></div>
    <div className="rq-preview-footer-row"><span>SEU RITMO</span><strong>6 favoritos · 3 looks usados</strong><b aria-hidden="true">este mês</b></div>
  </>
}

function InspirationView() {
  return <>
    <div className="rq-preview-heading"><div><span>REPERTÓRIO VISUAL</span><h3>Inspiração com os pés no chão.</h3></div><Link href="/cadastro" className="rq-preview-circle" aria-label="Adicionar inspiração">+</Link></div>
    <div className="rq-preview-inspiration"><div className="rq-preview-inspiration-image"><Image src="/images/wardrobe-hero.png" alt="Referência visual de um armário organizado" fill sizes="220px" /></div><div><span>REFERÊNCIA SALVA</span><strong>Texturas naturais<br />{' '}e tons de terra.</strong><p>O Roupzy encontra caminhos parecidos usando o que já está no seu closet.</p><Link href="/cadastro" className="rq-preview-action">Cruzar com closet <span aria-hidden="true">↗</span></Link></div></div>
    <div className="rq-preview-footer-row"><span>REFERÊNCIAS</span><strong>02 salvas no seu espaço</strong><b aria-hidden="true">ver tudo ↗</b></div>
  </>
}

export function RoupzyDashboardPreview() {
  const [activeView, setActiveView] = useState('overview')
  const activeLabel = navigation.find(([id]) => id === activeView)?.[1] || 'Visão geral'

  return <div className="rq-command-preview" aria-label="Demonstração interativa do painel Roupzy">
    <div className="rq-command-chrome"><span>ROUPZY / ESPAÇO PESSOAL</span><span><i /> DEMONSTRAÇÃO</span></div>
    <div className="rq-command-layout">
      <aside className="rq-command-sidebar">
        <div className="rq-command-brand"><span>R</span><div><strong>Meu espaço</strong><small>organizado para você</small></div></div>
        <span className="rq-command-label">NAVEGAR</span>
        <nav aria-label="Demonstração do painel">
          {navigation.map(([id, label], index) => <button type="button" className={activeView === id ? 'is-active' : ''} aria-pressed={activeView === id} onClick={() => setActiveView(id)} key={id}><b>{String(index + 1).padStart(2, '0')}</b><span>{label}</span></button>)}
        </nav>
        <div className="rq-command-sidebar-note"><span>ACERVO</span><strong>28 peças</strong><small>ativas e prontas</small></div>
      </aside>
      <section className="rq-command-main">
        <header className="rq-command-main-top"><span>{activeLabel}</span><span className="rq-command-online"><i /> sincronizado</span></header>
        {activeView === 'overview' ? <OverviewView /> : null}
        {activeView === 'closet' ? <ClosetView /> : null}
        {activeView === 'looks' ? <LooksView /> : null}
        {activeView === 'inspiration' ? <InspirationView /> : null}
      </section>
    </div>
  </div>
}
