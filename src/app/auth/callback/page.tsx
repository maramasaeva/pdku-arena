'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.push('/vote')
      }
    })

    const timeout = setTimeout(() => router.push('/vote'), 5000)
    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display font-bold text-3xl neon-cyan mb-4">
          logging you in...
        </h1>
        <p className="text-sm text-white/40">
          Hang tight, redirecting to the arena.
        </p>
      </div>
    </div>
  )
}
