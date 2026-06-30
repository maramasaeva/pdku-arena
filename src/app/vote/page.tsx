'use client'

import { useState, useEffect } from 'react'
import { PARTICIPANTS, POLL_CATEGORIES } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import ParticipantCard from '@/components/ParticipantCard'
import ProfileModal from '@/components/ProfileModal'
import type { Participant } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

export default function VotePage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeCategory, setActiveCategory] = useState(POLL_CATEGORIES[0].id)
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [selectedProfile, setSelectedProfile] = useState<Participant | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState<Record<string, Record<string, number>>>({})

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    loadResults()
    loadMyVotes()
  }, [user])

  async function loadResults() {
    try {
      const { data } = await supabase
        .from('votes')
        .select('category_id, participant_id')
      if (!data) return

      const counts: Record<string, Record<string, number>> = {}
      for (const vote of data) {
        if (!counts[vote.category_id]) counts[vote.category_id] = {}
        counts[vote.category_id][vote.participant_id] =
          (counts[vote.category_id][vote.participant_id] || 0) + 1
      }
      setResults(counts)
    } catch {
      // DB not set up yet — use empty results
    }
  }

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
      // Nav's login modal handles auth — scroll up to prompt them
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (votes[categoryId]) return

    setSubmitting(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      await supabase.from('votes').insert({
        user_id: user.id,
        category_id: categoryId,
        participant_id: participantId,
        vote_date: today,
      })

      setVotes(prev => ({ ...prev, [categoryId]: participantId }))
      setResults(prev => {
        const catResults = { ...(prev[categoryId] || {}) }
        catResults[participantId] = (catResults[participantId] || 0) + 1
        return { ...prev, [categoryId]: catResults }
      })
    } catch {
      // Handle gracefully
    }
    setSubmitting(false)
  }

  function getPercentage(categoryId: string, participantId: string): number {
    const catResults = results[categoryId]
    if (!catResults) return 0
    const total = Object.values(catResults).reduce((a, b) => a + b, 0)
    if (total === 0) return 0
    return ((catResults[participantId] || 0) / total) * 100
  }

  const activeCat = POLL_CATEGORIES.find(c => c.id === activeCategory)!

  return (
    <div className="min-h-screen pt-16 pb-12">
      <div className="mb-12">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30 mb-3">
          Daily Polls
        </div>
        <h1 className="font-display font-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight neon-cyan mb-3">
          cast your vote
        </h1>
        <p className="text-sm text-white/40 leading-relaxed">
          {user ? 'One vote per category per day. Choose wisely.' : 'Sign in to start voting.'}
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-12 -mx-2 px-2">
        {POLL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              flex-shrink-0 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider
              transition-all duration-200 border
              ${activeCategory === cat.id
                ? 'bg-neon-cyan text-black border-neon-cyan shadow-[0_0_20px_rgba(31,196,255,0.2)]'
                : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:border-white/20 hover:text-white/60'
              }
            `}
          >
            <span className="mr-1.5">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Active category */}
      <div className="mb-10">
        <h2 className="font-bold text-xl mb-3 flex items-center gap-3">
          <span className="text-2xl">{activeCat.icon}</span>
          {activeCat.name}
        </h2>
        <p className="text-sm text-white/35 leading-relaxed">{activeCat.description}</p>
        {votes[activeCategory] && (
          <div className="mt-3 inline-flex items-center gap-2 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full px-4 py-1.5 text-xs font-mono text-neon-cyan">
            <span>&#10003;</span> You voted today
          </div>
        )}
      </div>

      {/* Participant voting list */}
      <div className="grid gap-5 max-w-4xl stagger-children">
        {PARTICIPANTS
          .map(p => ({
            participant: p,
            pct: getPercentage(activeCategory, p.id),
          }))
          .sort((a, b) => b.pct - a.pct)
          .map(({ participant, pct }) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              percentage={pct}
              showVoteButton
              voted={votes[activeCategory] === participant.id}
              onVote={() => castVote(activeCategory, participant.id)}
              onProfileClick={() => setSelectedProfile(participant)}
            />
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
