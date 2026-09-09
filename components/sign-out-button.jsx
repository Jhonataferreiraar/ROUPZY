'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SignOutButton({ redirectTo = '/login', className = 'app-signout' }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function signOut() {
    setLoading(true)
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' })
    } catch {
      setLoading(false)
    } finally {
      router.replace(redirectTo)
      router.refresh()
    }
  }

  return (
    <button className={className} type="button" onClick={signOut} disabled={loading}>
      {loading ? 'Saindo…' : 'Sair'}
    </button>
  )
}
