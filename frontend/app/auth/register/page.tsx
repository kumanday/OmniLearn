'use client'
// @ts-nocheck

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser } from '../../../lib/api'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // Basic client-side validation to reduce backend 4xx
      if (!name.trim()) throw new Error('Name is required')
      if (!email.trim()) throw new Error('Email is required')
      if (password.length < 6) throw new Error('Password must be at least 6 characters')

      await registerUser(email, password, name)
      router.push('/auth/login')
    } catch (err: any) {
      console.error('Registration error:', err?.response?.data || err)
      const detail = err?.response?.data?.detail
      const message =
        (typeof detail === 'string' && detail) ||
        (Array.isArray(detail) && detail[0]?.msg) ||
        err?.response?.data?.message ||
        err?.message ||
        'Registration error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-center">Create account</h1>
        <p className="text-center text-gray-600 mt-1">Sign up to get started</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input className="mt-1 w-full border rounded px-3 py-2" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input className="mt-1 w-full border rounded px-3 py-2" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-60">
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Already have an account? <Link className="text-blue-600 underline" href="/auth/login">Sign in</Link>
        </p>
      </div>
    </main>
  )
}


