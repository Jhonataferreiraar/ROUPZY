'use client'

import Image from 'next/image'
import { useState } from 'react'

const modes = {
  casual: {
    tab: 'CASUAL',
    label: 'CASUAL / PRESENÇA',
    title: ['Casual', 'com presença.'],
    description: 'Uma base limpa. Uma camada com textura. O detalhe certo para sair do automático.',
    pieces: ['camisa de linho', 'camisa sobreposta oliva', 'alfaiataria']
  },
  work: {
    tab: 'TRABALHO',
    label: 'TRABALHO / FOCO',
    title: ['Silhueta', 'precisa.'],
    description: 'Proporção, conforto e uma camada que acompanha o ritmo sem perder intenção.',
    pieces: ['camisa de linho', 'alfaiataria', 'mocassim caramelo']
  },
  dinner: {
    tab: 'JANTAR',
    label: 'JANTAR / LUZ',
    title: ['Um pouco', 'mais de noite.'],
    description: 'Textura e contraste na medida para mudar a energia das peças que você já conhece.',
    pieces: ['tricô ferrugem', 'alfaiataria', 'mocassim caramelo']
  }
}

export function StyleLab() {
  const [mode, setMode] = useState('casual')
  const current = modes[mode]

  return (
    <div className="system-dashboard style-lab" aria-label="Demonstração interativa do sistema Roupzy">
      <div className="system-dashboard-top"><span>DEMONSTRAÇÃO / INTERFACE CONCEITUAL</span><span className="system-status"><i aria-hidden="true" /> VISÃO PRIVADA</span></div>
      <div className="system-board">
        <div className="system-board-photo"><Image src="/images/dentro-wardrobe-system.png" alt="Ilustração tecnológica de um guarda-roupa com peças organizadas" fill sizes="(max-width: 760px) 100vw, 38vw" /><span>VISUAL 01 / 03</span></div>
        <div className="system-insight" aria-live="polite">
          <div className="system-insight-heading"><span>SUGESTÃO DO DIA</span><span>09:42</span></div>
          <div className="style-lab-controls" role="tablist" aria-label="Escolha uma ocasião"><span>ESCOLHA UM ESTILO</span><div>{Object.entries(modes).map(([key, item]) => <button className={mode === key ? 'is-active' : ''} key={key} type="button" role="tab" aria-selected={mode === key} onClick={() => setMode(key)}>{item.tab}</button>)}</div></div>
          <div className="system-insight-title"><small>PARA HOJE</small><strong>{current.title[0]}<br />{' '}{current.title[1]}</strong><p>{current.description}</p></div>
          <div className="system-insight-list">{current.pieces.map((piece, index) => <span key={piece}><b>{String(index + 1).padStart(2, '0')}</b> {piece}</span>)}</div>
          <div className="system-insight-foot"><span>SÓ DO SEU CLOSET</span><span>PRONTO</span></div>
        </div>
      </div>
      <div className="system-dashboard-bottom"><span>ENTRADA / OCASIÃO</span><strong>{current.label}</strong><span>ANÁLISE / PRONTA</span></div>
    </div>
  )
}
