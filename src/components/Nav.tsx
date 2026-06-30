'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Nav() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  const links = [
    { href: '/', label: 'Arena' },
    { href: '/vote', label: 'Vote' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-[200] bg-[rgba(10,10,15,0.6)] backdrop-blur-2xl border-b border-white/[0.06] px-[4vw] flex items-center justify-between h-14">
      <Link href="/" className="font-heading font-extrabold text-lg tracking-tight hover:brightness-130 transition-[filter] duration-300">
        <span className="text-neon-cyan">pdku</span>
        <span className="text-neon-pink">:</span>
        <span className="text-neon-yellow">arena</span>
      </Link>

      <div className="desktop-only flex gap-8 text-xs font-medium">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`uppercase tracking-widest transition-colors duration-200 ${
              pathname === link.href
                ? 'text-neon-cyan'
                : 'text-white/40 hover:text-neon-cyan'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 desktop-only">
              {user.user_metadata?.full_name || user.email}
            </span>
            <button onClick={signOut} className="text-xs text-white/30 hover:text-neon-pink transition-colors uppercase tracking-wider">
              Logout
            </button>
          </div>
        ) : (
          <button onClick={signIn} className="glow-btn !py-2 !px-5 !text-xs">
            Sign in to Vote
          </button>
        )}

        <button
          className="mobile-only text-white/60 text-xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-only absolute top-14 left-0 right-0 bg-[rgba(10,10,15,0.95)] backdrop-blur-2xl border-b border-white/[0.06] p-6 flex flex-col gap-4">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`text-sm uppercase tracking-widest ${
                pathname === link.href ? 'text-neon-cyan' : 'text-white/40'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
