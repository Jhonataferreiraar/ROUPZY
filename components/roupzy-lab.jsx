'use client'

import { useState } from 'react'

const moments = [
  { id: 'trabalho', label: 'Trabalho', title: 'Presença sem esforço.', detail: 'base limpa · linhas precisas', accent: '#b7eaff' },
  { id: 'encontro', label: 'Encontro', title: 'Uma cor que aproxima.', detail: 'textura leve · ponto de cor', accent: '#ffb7bd' },
  { id: 'fim-de-semana', label: 'Fim de semana', title: 'Leve, mas com intenção.', detail: 'conforto · movimento · natural', accent: '#ffe5a6' }
]

export function RoupzyLab() {
  const [selectedId, setSelectedId] = useState(moments[0].id)
  const selected = moments.find((moment) => moment.id === selectedId) ?? moments[0]

  return (
    <div className="roupzy-lab-card" aria-label="Demonstração interativa do Roupzy">
      <div className="rq-lab-top"><span>Laboratório de looks</span><b>Demonstração ao vivo</b></div>
      <div className="rq-lab-content">
        <div>
          <span className="rq-number">01 / CONTEXTO</span>
          <h4>O que você<br />{' '}<em>vai viver hoje?</em></h4>
          <p>O Roupzy cruza ocasião e preferência para revelar caminhos com as peças que já fazem parte do seu armário.</p>
          <div className="rq-lab-choice-group" role="group" aria-label="Escolha um momento">
            {moments.map((moment) => (
              <button type="button" key={moment.id} aria-pressed={selected.id === moment.id} onClick={() => setSelectedId(moment.id)}>
                {moment.label}
              </button>
            ))}
          </div>
        </div>
        <div className="rq-lab-result" aria-live="polite">
          <div className="rq-lab-result-top"><span>Uma ideia possível</span><span>3 peças do seu closet</span></div>
          <span className="rq-garment" style={{ backgroundColor: selected.accent }} aria-hidden="true" />
          <div className="rq-lab-result-bottom"><div><small>{selected.detail}</small><strong>{selected.title}</strong></div><b aria-hidden="true">↗</b></div>
        </div>
        <div className="rq-lab-note"><span>O resultado muda com o seu contexto.</span><strong>Mude o momento ↑</strong></div>
      </div>
    </div>
  )
}
