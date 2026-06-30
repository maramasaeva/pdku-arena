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
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [loginState, setLoginState] = useState<'idle' | 'sending' | 'sent'>('idle')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) setShowLogin(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoginState('sending')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (!error) {
      setLoginState('sent')
    } else {
      setLoginState('idle')
    }
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
    <>
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
                {user.email}
              </span>
              <button onClick={signOut} className="text-xs text-white/30 hover:text-neon-pink transition-colors uppercase tracking-wider">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} className="glow-btn !py-2 !px-5 !text-xs">
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

      {/* Magic link login modal */}
      {showLogin && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowLogin(false) }}
        >
          <div className="glass-card p-8 max-w-sm w-full border-neon-cyan/20 relative">
            <button
              onClick={() => { setShowLogin(false); setLoginState('idle'); setEmail('') }}
              className="absolute top-4 right-4 text-white/30 hover:text-white text-lg"
            >
              &times;
            </button>

            <h2 className="font-display font-bold text-2xl neon-cyan mb-2">
              enter the arena
            </h2>

            {loginState === 'sent' ? (
              <div>
                <p className="text-sm text-neon-green mb-2">
                  Magic link sent!
                </p>
                <p className="text-xs text-white/40">
                  Check <strong className="text-white/60">{email}</strong> for a login link. Click it to start voting.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-white/40 mb-5">
                  Enter your email and we&apos;ll send you a magic link. No password needed.
                </p>
                <form onSubmit={sendMagicLink}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm font-light placeholder:text-white/20 focus:outline-none focus:border-neon-cyan/50 focus:shadow-[0_0_15px_rgba(31,196,255,0.1)] transition-all mb-4"
                  />
                  <button
                    type="submit"
                    disabled={loginState === 'sending'}
                    className="glow-btn w-full !block text-center"
                  >
                    {loginState === 'sending' ? 'Sending...' : 'Send Magic Link'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
