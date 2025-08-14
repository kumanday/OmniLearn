'use client'

import { useEffect, useState } from 'react'
import { getMe, logout } from '../../lib/api'
import Link from 'next/link'

type Me = { id: number; email: string; name: string; picture_url?: string }

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMe()
      .then((u) => setMe(u))
      .catch(() => setError('Not authenticated'))
      .finally(() => setLoading(false))
  }, [])

  const onLogout = async () => {
    await logout()
    try {
      // Clear local token and cookie
      localStorage.removeItem('ol_jwt')
      document.cookie = 'ol_jwt=; Path=/; Max-Age=0; SameSite=Lax'
    } catch {}
    location.href = '/'
  }

  if (loading) return <div className="p-8">Loading...</div>

  if (error) return (
    <div className="p-8">
      <p className="mb-4">{error}</p>
      <Link href="/" className="underline">Back</Link>
    </div>
  )

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My profile</h1>
      {me?.picture_url && <img src={me.picture_url} alt="avatar" className="w-16 h-16 rounded-full mb-4" />}
      <div className="space-y-1">
        <div><span className="font-semibold">ID:</span> {me?.id}</div>
        <div><span className="font-semibold">Name:</span> {me?.name}</div>
        <div><span className="font-semibold">Email:</span> {me?.email}</div>
      </div>
      <button onClick={onLogout} className="mt-6 px-4 py-2 bg-red-600 text-white rounded">Log out</button>
    </div>
  )
}


