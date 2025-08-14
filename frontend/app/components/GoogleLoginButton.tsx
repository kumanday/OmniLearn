'use client'
// @ts-nocheck

import { useEffect, useRef } from 'react'
import { loadGoogleIdentityScript } from '../lib/google'
import { loginWithGoogle, setAuthToken } from '../../lib/api'

type Props = {
  clientId: string
  onSuccess?: () => void
}

export default function GoogleLoginButton({ clientId, onSuccess }: Props) {
  const btnRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    loadGoogleIdentityScript().then(() => {
      // @ts-ignore
      const google = window.google
      if (!google || !btnRef.current) return
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp: any) => {
          try {
            const data = await loginWithGoogle(resp.credential)
            if (data?.access_token) {
              localStorage.setItem('ol_jwt', data.access_token)
              setAuthToken(data.access_token)
              try {
                const oneWeekInSeconds = 60 * 60 * 24 * 7
                document.cookie = `ol_jwt=${data.access_token}; Path=/; Max-Age=${oneWeekInSeconds}; SameSite=Lax`
              } catch {}
            }
            onSuccess?.()
          } catch (e) {
            console.error('Login failed', e)
          }
        },
      })
      google.accounts.id.renderButton(btnRef.current, { theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular' })
    })
  }, [clientId, onSuccess])

  return <div ref={btnRef} />
}


