'use client'

import { useEffect } from 'react'
import { setAuthToken } from '../../lib/api'

type Props = { children: React.ReactNode }

export default function AuthProvider({ children }: Props) {
  useEffect(() => {
    let token: string | null = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('ol_jwt')
      if (!token) {
        try {
          const match = document.cookie.match(/(?:^|; )ol_jwt=([^;]+)/)
          token = match ? decodeURIComponent(match[1]) : null
        } catch {}
      }
    }
    setAuthToken(token)
  }, [])
  return <>{children}</>
}


