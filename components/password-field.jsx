'use client'

import { useId, useState } from 'react'

export function PasswordField({ label, value, onChange, autoComplete, minLength, placeholder, required = true }) {
  const [visible, setVisible] = useState(false)
  const inputId = useId()

  return (
    <label className="password-field" htmlFor={inputId}>
      <span>{label}</span>
      <span className="password-field-control">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        <button type="button" className="password-reveal" onClick={() => setVisible((current) => !current)} aria-label={visible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`} aria-pressed={visible}>
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </span>
    </label>
  )
}
