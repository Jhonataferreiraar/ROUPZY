'use client'

import { useState } from 'react'

const options = [
  {
    id: 'calma',
    label: 'Um dia leve',
    meta: 'CASUAL / 09:20',
    title: 'Leve, mas com intenção.',
    text: 'Uma base clara, uma textura natural e espaço para o dia acontecer.',
    pieces: [
      ['camisa', 'Camisa de linho', 'base clara'],
      ['calca', 'Calça de algodão', 'tom de terra'],
      ['tenis', 'Tênis de lona', 'passo leve']
    ],
    palette: ['#e8e0cf', '#a5ad8f', '#e76f58']
  },
  {
    id: 'presenca',
    label: 'Entre reuniões',
    meta: 'TRABALHO / 14:00',
    title: 'Presença sem esforço.',
    text: 'Linhas limpas para quando a ocasião pede clareza, sem apagar quem você é.',
    pieces: [
      ['camisa-azul', 'Camisa azul', 'linha essencial'],
      ['calca-escura', 'Calça reta', 'base profunda'],
      ['sapato', 'Sapato marrom', 'acabamento']
    ],
    palette: ['#bbced1', '#26384f', '#9d6d50']
  },
  {
    id: 'noite',
    label: 'Depois das seis',
    meta: 'JANTAR / 19:40',
    title: 'Uma mudança de ritmo.',
    text: 'Poucos elementos, uma cor que aparece e uma nova energia para a noite.',
    pieces: [
      ['camisa-coral', 'Camisa terracota', 'ponto de cor'],
      ['calca-preta', 'Calça preta', 'base precisa'],
      ['sapato-preto', 'Sapato preto', 'acabamento']
    ],
    palette: ['#d7775f', '#202735', '#c7aa8e']
  }
]

export function ClosetPlayground() {
  const [selectedId, setSelectedId] = useState(options[0].id)
  const [saved, setSaved] = useState(false)
  const selected = options.find((option) => option.id === selectedId) ?? options[0]

  function chooseOption(id) {
    setSelectedId(id)
    setSaved(false)
  }

  return (
    <div className="playground" aria-label="Demonstração interativa de combinações">
      <div className="playground-sidebar">
        <div className="playground-sidebar-top">
          <span className="playground-code">ROUPZY / LAB</span>
          <span className="playground-status"><i aria-hidden="true" /> ao vivo</span>
        </div>
        <p className="playground-question">O que você<br />{' '}<em>vai viver hoje?</em></p>
        <div className="playground-options" role="group" aria-label="Escolha um momento">
          {options.map((option, index) => (
            <button
              type="button"
              key={option.id}
              className={selectedId === option.id ? 'is-selected' : ''}
              aria-pressed={selectedId === option.id}
              onClick={() => chooseOption(option.id)}
            >
              <span>0{index + 1}</span>
              <strong>{option.label}</strong>
              <i aria-hidden="true">↗</i>
            </button>
          ))}
        </div>
        <div className="playground-sidebar-note">
          <span>CONTEXTO</span>
          <p>Uma escolha muda a leitura de tudo ao redor.</p>
        </div>
      </div>

      <div className="playground-content">
        <div className="playground-content-top">
          <span>{selected.meta}</span>
          <button type="button" className={saved ? 'save-control is-saved' : 'save-control'} onClick={() => setSaved(!saved)} aria-pressed={saved}>
            <span aria-hidden="true">{saved ? '♥' : '♡'}</span>{saved ? 'Guardado nesta visita' : 'Guardar ideia'}
          </button>
        </div>
        <div className="playground-main">
          <div className="playground-look" aria-hidden="true">
            <span className="look-halo" />
            <span className="look-number">0{options.findIndex((option) => option.id === selected.id) + 1}</span>
            {selected.pieces.map(([kind], index) => <span className={`look-object look-object-${index + 1} object-${kind}`} key={kind} />)}
            <span className="look-axis" />
            <span className="look-coordinate">44° 00&apos; S<br />{' '}19° 55&apos; W</span>
          </div>
          <div className="playground-recommendation" aria-live="polite">
            <span className="recommendation-label">COMBINAÇÃO SUGERIDA</span>
            <h3>{selected.title}</h3>
            <p>{selected.text}</p>
            <div className="playground-palette" aria-label="Paleta da combinação">
              {selected.palette.map((color) => <span key={color} style={{ backgroundColor: color }} />)}
            </div>
            <div className="playground-piece-list">
              {selected.pieces.map(([kind, name, detail], index) => (
                <div className="playground-piece-row" key={kind}>
                  <span>0{index + 1}</span>
                  <b>{name}</b>
                  <small>{detail}</small>
                  <i aria-hidden="true">↗</i>
                </div>
              ))}
            </div>
            <span className="playground-disclosure">Exemplo de navegação. As peças acima são ilustrativas.</span>
          </div>
        </div>
        <div className="playground-bottom"><span>uma leitura possível do seu armário</span><span>ROUPZY / {selected.id}</span></div>
      </div>
    </div>
  )
}
