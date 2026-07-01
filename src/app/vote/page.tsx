'use client'

import { useState, useEffect, useCallback } from 'react'
import { PARTICIPANTS, POLL_CATEGORIES } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import ProfileModal from '@/components/ProfileModal'
import type { Participant } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

export default function VotePage() {
  const [user, setUser] = useState<User | null>(null)
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [selectedProfile, setSelectedProfile] = useState<Participant | null>(null)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [failedImgs, setFailedImgs] = useState<Set<string>>(new Set())

  const onImgError = useCallback((id: string) => {
    setFailedImgs(prev => new Set(prev).add(id))
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    loadMyVotes()
  }, [user])

  async function loadMyVotes() {
    if (!user) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('votes')
        .select('category_id, participant_id')
        .eq('user_id', user.id)
        .eq('vote_date', today)
      if (!data) return

      const myVotes: Record<string, string> = {}
      for (const v of data) {
        myVotes[v.category_id] = v.participant_id
      }
      setVotes(myVotes)
    } catch {
      // DB not set up yet
    }
  }

  async function castVote(categoryId: string, participantId: string) {
    if (!user) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (votes[categoryId]) return

    const key = `${categoryId}-${participantId}`
    setSubmitting(key)
    try {
      const today = new Date().toISOString().split('T')[0]
      const { error } = await supabase.from('votes').insert({
        user_id: user.id,
        category_id: categoryId,
        participant_id: participantId,
        vote_date: today,
      })

      if (!error) {
        setVotes(prev => ({ ...prev, [categoryId]: participantId }))
      }
    } catch {
      // Handle gracefully
    }
    setSubmitting(null)
  }

  const votedCount = Object.keys(votes).length

  return (
    <div className="min-h-screen pt-16 pb-12">
      <div className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30 mb-3">
          Daily Polls
        </div>
        <h1 className="font-display font-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight neon-cyan mb-3">
          cast your vote
        </h1>
        <p className="text-sm text-white/40 leading-relaxed mb-4">
          {user ? 'Tap an emoji on someone\'s card to vote for them in that category. One vote per category per day.' : 'Sign in to start voting.'}
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/30">
          {POLL_CATEGORIES.map(cat => (
            <span key={cat.id} className="flex items-center gap-1.5">
              <span className="text-sm">{cat.icon}</span>
              <span>{cat.name}</span>
              {votes[cat.id] && <span className="text-neon-cyan">&#10003;</span>}
            </span>
          ))}
        </div>

        {user && votedCount > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full px-4 py-1.5 text-xs font-mono text-neon-cyan">
            {votedCount}/{POLL_CATEGORIES.length} voted
          </div>
        )}
      </div>

      {/* Participant grid with emoji voting */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {PARTICIPANTS.map(p => (
          <div key={p.id} className="glass-card p-4 flex flex-col items-center text-center group">
            {/* Avatar */}
            <div
              onClick={() => setSelectedProfile(p)}
              className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/10 group-hover:border-neon-cyan/40 transition-colors bg-white/5 mb-2 cursor-pointer"
            >
              {p.photo_url && !failedImgs.has(p.id) ? (
                <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" onError={() => onImgError(p.id)} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white/15 font-mono">
                  {p.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Name */}
            <h3
              onClick={() => setSelectedProfile(p)}
              className="font-bold text-xs leading-tight mb-3 cursor-pointer hover:text-neon-cyan transition-colors truncate w-full"
            >
              {p.name}
            </h3>

            {/* Emoji vote buttons */}
            <div className="grid grid-cols-4 gap-1.5 w-full">
              {POLL_CATEGORIES.map(cat => {
                const isVotedThis = votes[cat.id] === p.id
                const isCategoryUsed = !!votes[cat.id]
                const isSubmittingThis = submitting === `${cat.id}-${p.id}`

                return (
                  <button
                    key={cat.id}
                    onClick={() => castVote(cat.id, p.id)}
                    disabled={isCategoryUsed || !user || isSubmittingThis}
                    title={cat.name}
                    className={`
                      text-base sm:text-lg aspect-square rounded-lg transition-all duration-200
                      flex items-center justify-center
                      ${isVotedThis
                        ? 'bg-neon-cyan/20 border border-neon-cyan/40 scale-110 shadow-[0_0_12px_rgba(31,196,255,0.3)]'
                        : isCategoryUsed
                          ? 'opacity-20 cursor-default bg-white/[0.02]'
                          : 'bg-white/[0.03] hover:bg-white/[0.08] hover:scale-110 cursor-pointer border border-transparent hover:border-white/10'
                      }
                      ${isSubmittingThis ? 'animate-pulse' : ''}
                    `}
                  >
                    {cat.icon}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {!user && (
        <div className="mt-10 text-center">
          <p className="text-white/30 text-sm mb-4">Sign in to cast your votes</p>
          <p className="text-xs text-white/20">Use the &ldquo;Sign in to Vote&rdquo; button in the top nav</p>
        </div>
      )}

      {selectedProfile && (
        <ProfileModal participant={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}
    </div>
  )
}
