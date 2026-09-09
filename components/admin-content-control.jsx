'use client'

import { useState } from 'react'

import { defaultPublicContent } from '@/lib/config/public-content-defaults'

function normalizeContent(value) {
  const home = value?.home && typeof value.home === 'object' ? value.home : {}
  const faq = Array.isArray(value?.faq) && value.faq.length ? value.faq : defaultPublicContent.faq
  return {
    home: { ...defaultPublicContent.home, ...home },
    faq: faq.map((item) => ({ question: String(item.question || ''), answer: String(item.answer || '') }))
  }
}

export function AdminContentControl({ setting, canManage, busy, onSave }) {
  const [form, setForm] = useState(() => normalizeContent(setting?.value))
  const [error, setError] = useState('')

  function updateHome(field, value) {
    setForm((current) => ({ ...current, home: { ...current.home, [field]: value } }))
  }

  function updateFaq(index, field, value) {
    setForm((current) => ({ ...current, faq: current.faq.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }))
  }

  function addFaq() {
    setForm((current) => ({ ...current, faq: [...current.faq, { question: '', answer: '' }] }))
  }

  function removeFaq(index) {
    setForm((current) => ({ ...current, faq: current.faq.filter((_, itemIndex) => itemIndex !== index) }))
  }

  function submit(event) {
    event.preventDefault()
    const faq = form.faq.map((item) => ({ question: item.question.trim(), answer: item.answer.trim() })).filter((item) => item.question || item.answer)
    if (!form.home.heroTitle.trim() || !form.home.heroHighlight.trim() || !form.home.heroDescription.trim() || faq.some((item) => !item.question || !item.answer)) {
      setError('Preencha os campos principais e complete cada pergunta antes de publicar.')
      return
    }
    if (!faq.length) {
      setError('Mantenha pelo menos uma pergunta frequente publicada.')
      return
    }
    setError('')
    onSave({ resource: 'setting', key: 'public.site_content', value: { home: form.home, faq } })
  }

  return <form noValidate className="admin-content-editor" onSubmit={submit}>
    <div className="admin-content-editor-head"><div><span className="app-kicker">Site público</span><h3>Conteúdo institucional</h3></div><small>{setting?.updated_at ? 'Última publicação: ' + new Date(setting.updated_at).toLocaleString('pt-BR') : 'Usando o conteúdo padrão até a primeira publicação.'}</small></div>
    <p className="admin-form-hint">Edite a chamada principal e as perguntas frequentes sem alterar código. A atualização aparece no site após a renovação do cache.</p>
    <div className="admin-content-editor-grid">
      <label><span>Título principal</span><input value={form.home.heroTitle} onChange={(event) => updateHome('heroTitle', event.target.value)} disabled={!canManage} /></label>
      <label><span>Destaque do título</span><input value={form.home.heroHighlight} onChange={(event) => updateHome('heroHighlight', event.target.value)} disabled={!canManage} /></label>
      <label className="admin-content-editor-wide"><span>Descrição principal</span><textarea className="resize-none" rows="3" value={form.home.heroDescription} onChange={(event) => updateHome('heroDescription', event.target.value)} disabled={!canManage} /></label>
      <label><span>Texto do botão principal</span><input value={form.home.heroCta} onChange={(event) => updateHome('heroCta', event.target.value)} disabled={!canManage} /></label>
      <label><span>Frase do rodapé</span><input value={form.home.footerLead} onChange={(event) => updateHome('footerLead', event.target.value)} disabled={!canManage} /></label>
    </div>
    <div className="admin-content-faq-head"><div><span className="app-kicker">Perguntas e respostas</span><strong>FAQ publicado</strong></div>{canManage ? <button type="button" className="admin-content-add" onClick={addFaq}>+ Adicionar pergunta</button> : null}</div>
    <div className="admin-content-faq-list">{form.faq.map((item, index) => <div className="admin-content-faq-item" key={index}><div className="admin-content-faq-number">{String(index + 1).padStart(2, '0')}</div><div className="admin-content-faq-fields"><label><span>Pergunta</span><input value={item.question} onChange={(event) => updateFaq(index, 'question', event.target.value)} disabled={!canManage} /></label><label><span>Resposta</span><textarea className="resize-none" rows="3" value={item.answer} onChange={(event) => updateFaq(index, 'answer', event.target.value)} disabled={!canManage} /></label></div>{canManage ? <button type="button" className="admin-content-remove" onClick={() => removeFaq(index)} aria-label={'Remover pergunta ' + (index + 1)}>×</button> : null}</div>)}</div>
    {canManage ? <button className="admin-content-save" type="submit" disabled={busy}>{busy ? 'Publicando…' : 'Publicar conteúdo'} <span aria-hidden="true">↗</span></button> : null}
    {error ? <p className="admin-inline-error" role="alert">{error}</p> : null}
  </form>
}
