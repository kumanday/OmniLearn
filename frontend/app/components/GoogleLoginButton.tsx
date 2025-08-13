'use client'

import { useEffect, useRef } from 'react'
import { loadGoogleIdentityScript } from '../lib/google'
import { loginWithGoogle } from '../../lib/api'

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
            await loginWithGoogle(resp.credential)
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


