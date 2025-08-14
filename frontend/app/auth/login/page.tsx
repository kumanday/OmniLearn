'use client'
// @ts-nocheck

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import GoogleLoginButton from '../../components/GoogleLoginButton'

function LoginForm() {
  const router = useRouter()
  const search = useSearchParams()
  const nextUrl = search?.get('next') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Invalid credentials')
      const data = await res.json()
      localStorage.setItem('ol_jwt', data.access_token)
      // Persist token in a cookie for middleware-based protection
      try {
        const oneWeekInSeconds = 60 * 60 * 24 * 7
        document.cookie = `ol_jwt=${data.access_token}; Path=/; Max-Age=${oneWeekInSeconds}; SameSite=Lax`
      } catch {}
      router.push(nextUrl)
    } catch (err: any) {
      setError(err.message || 'Error signing in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <p className="text-center text-gray-600 mt-1">Welcome to OmniLearn</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="my-4 text-center text-gray-500 text-sm">or</div>
        <GoogleLoginButton clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''} onSuccess={() => router.push(nextUrl)} />

        <p className="mt-4 text-sm text-center">
          Don't have an account? <Link className="text-blue-600 underline" href="/auth/register">Sign up</Link>
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}> 
      <LoginForm />
    </Suspense>
  )
}


