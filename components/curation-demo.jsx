'use client'

import { useState } from 'react'

const moments = [
  { id: 'trabalho', label: 'Trabalho', note: 'linha limpa · presença tranquila', title: 'Presença sem esforço', pieces: ['Camisa de linho', 'Calça reta', 'Sapato claro'], accent: 'blue' },
  { id: 'encontro', label: 'Encontro', note: 'textura leve · ponto de cor', title: 'Uma cor que aproxima', pieces: ['Camisa de linho', 'Saia midi', 'Tênis baixo'], accent: 'red' },
  { id: 'fim-de-semana', label: 'Fim de semana', note: 'conforto · movimento · natural', title: 'Leve, com intenção', pieces: ['Camiseta macia', 'Calça reta', 'Tênis baixo'], accent: 'yellow' }
]

function Sketch({ type }) {
  if (type === 'top') return <svg viewBox="0 0 120 140" aria-hidden="true"><path d="M37 24 12 39l13 24 12-8v57h46V55l12 8 13-24-25-15-14 11H51Z" /><path d="M51 35 60 47l9-12M60 47v65" /></svg>
  if (type === 'bottom') return <svg viewBox="0 0 120 140" aria-hidden="true"><path d="m35 18 20 4h10l20-4 4 38-14 3-5 70H50l-5-70-14-3Z" /><path d="M55 22v37M65 22v37M45 59h30" /></svg>
  if (type === 'shoe') return <svg viewBox="0 0 150 100" aria-hidden="true"><path d="M25 33c10 20 26 31 49 36l44 10c9 2 15 7 18 15H15c-5 0-8-4-6-9l10-20Z" /><path d="M20 78h114M46 38l-8 16m25-1-9 11m30-6-6 7" /></svg>
  return <svg viewBox="0 0 120 140" aria-hidden="true"><path d="M28 51c0-17 13-29 32-29s32 12 32 29l7 59H21Z" /><path d="M39 49V35c0-15 8-24 21-24s21 9 21 24v14M28 63h64" /></svg>
}

export function CurationDemo() {
  const [selectedId, setSelectedId] = useState(moments[0].id)
  const selected = moments.find((moment) => moment.id === selectedId) || moments[0]

  return (
    <div className="ri-curation-demo" aria-label="Demonstração interativa de curadoria de looks">
      <div className="ri-demo-topline"><span>Roupzy / bancada de curadoria</span><span><i /> demonstração local</span></div>
      <div className="ri-demo-grid">
        <section className="ri-demo-brief">
          <div className="ri-demo-label"><span>01</span><span>Escolha o momento</span></div>
          <h3>O que o seu dia<br /><em>está pedindo?</em></h3>
          <p>Troque o contexto e veja a mesma seleção de peças assumir outra leitura.</p>
          <div className="ri-moment-list" role="group" aria-label="Escolha um momento">
            {moments.map((moment) => <button type="button" className={selected.id === moment.id ? 'is-selected' : ''} aria-pressed={selected.id === moment.id} onClick={() => setSelectedId(moment.id)} key={moment.id}><span>{moment.label}</span><i className="ri-arrow" aria-hidden="true" /></button>)}
          </div>
        </section>
        <section className={'ri-demo-result ri-demo-result-' + selected.accent} aria-live="polite">
          <div className="ri-result-heading"><span>Leitura possível</span><span>3 peças já no closet</span></div>
          <div className="ri-result-title"><small>{selected.note}</small><h4>{selected.title}</h4></div>
          <div className="ri-result-pieces">{selected.pieces.map((piece, index) => <div key={piece}><span className={'ri-mini-sketch ri-mini-sketch-' + ((index % 3) + 1)}><Sketch type={index === 0 ? 'top' : index === 1 ? 'bottom' : 'shoe'} /></span><strong>{piece}</strong><small>do seu arquivo</small></div>)}</div>
          <a className="ri-text-action" href="/cadastro">Criar meu espaço <span className="ri-arrow" aria-hidden="true" /></a>
        </section>
      </div>
      <div className="ri-demo-foot"><span>O Roupzy reorganiza possibilidades; você continua escolhendo.</span><span>mude o contexto <i className="ri-arrow ri-arrow-down" aria-hidden="true" /></span></div>
    </div>
  )
}
