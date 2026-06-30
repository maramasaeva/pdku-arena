'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PARTICIPANTS, POLL_CATEGORIES } from '@/lib/data'
import { Participant } from '@/lib/types'
import ProfileModal from '@/components/ProfileModal'

export default function Home() {
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center py-28">
        <div className="font-mono text-xs tracking-[0.25em] uppercase text-neon-teal/60 mb-8">
          plzdontkillus &mdash; berkeley, july 2026
        </div>

        <h1 className="font-display font-bold text-[clamp(3.5rem,12vw,10rem)] leading-[0.95] tracking-tighter mb-8">
          <span className="neon-cyan">pdku</span>
          <span className="neon-pink">:</span>
          <br className="sm:hidden" />
          <span className="neon-yellow">arena</span>
        </h1>

        <p className="text-[clamp(1rem,2vw,1.3rem)] font-light max-w-lg leading-relaxed text-white/50 mb-6">
          The <strong className="font-semibold text-neon-cyan">people&apos;s court</strong> decides.
          Vote daily. Track sentiment. See who the audience loves
          &mdash; and whether the <em className="text-neon-pink font-normal">jury</em> agrees.
        </p>

        <div className="font-mono text-xs tracking-[0.15em] uppercase text-neon-green/50 mb-12">
          real-time polls <span className="mx-3 opacity-30">/</span>
          live visualizations <span className="mx-3 opacity-30">/</span>
          {POLL_CATEGORIES.length} categories
        </div>

        <div className="flex gap-5 flex-wrap justify-center">
          <Link href="/vote" className="glow-btn">
            Cast Your Vote
          </Link>
          <Link href="/leaderboard" className="glow-btn glow-btn-pink">
            Leaderboard
          </Link>
        </div>
      </section>

      <div className="neon-divider" />

      {/* Poll Categories Preview */}
      <section className="py-24">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30 mb-4">
          Poll Categories
        </div>
        <h2 className="font-display font-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight neon-cyan mb-3">
          8 ways to judge
        </h2>
        <p className="text-sm text-white/40 max-w-md mb-12 leading-relaxed">
          Vote in every category, every day. Your voice shapes the leaderboard.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {POLL_CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={`/vote#${cat.slug}`}
              className="glass-card p-6 group"
            >
              <div className="text-3xl mb-4">{cat.icon}</div>
              <h3 className="font-bold text-sm mb-1.5 group-hover:text-neon-cyan transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-white/35 leading-relaxed">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="neon-divider" />

      {/* Participants Grid */}
      <section className="py-24">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30 mb-4">
          The Contestants
        </div>
        <h2 className="font-display font-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight neon-pink mb-3">
          who enters the arena?
        </h2>
        <p className="text-sm text-white/40 max-w-md mb-12 leading-relaxed">
          {PARTICIPANTS.length} creators enter the arena. July 2026, Berkeley.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {PARTICIPANTS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSelectedParticipant(p)}
              className="glass-card p-4 text-center group cursor-pointer text-left"
            >
              <div className="w-14 h-14 mx-auto rounded-lg overflow-hidden border-2 border-white/10 group-hover:border-neon-cyan/40 transition-colors bg-white/5 mb-3">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg text-white/15 font-mono">
                    {i + 1}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-xs leading-tight mb-1 text-center">{p.name}</h3>
              <p className="text-[10px] text-white/25 leading-snug line-clamp-2 text-center">{p.bio}</p>
              {Object.keys(p.socials).length > 0 && (
                <div className="flex gap-2 justify-center mt-2">
                  {p.socials.twitter && <span className="text-[10px] text-white/20">X</span>}
                  {p.socials.instagram && <span className="text-[10px] text-white/20">IG</span>}
                  {p.socials.youtube && <span className="text-[10px] text-white/20">YT</span>}
                  {p.socials.website && <span className="text-[10px] text-white/20">Web</span>}
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      <div className="neon-divider" />

      {/* How it works */}
      <section className="py-24">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30 mb-4">
          How It Works
        </div>
        <h2 className="font-display font-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight neon-yellow mb-12">
          cast judgment
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          {[
            { title: 'Sign in', desc: 'Enter your email and click the magic link. One vote per person per day keeps things honest.' },
            { title: 'Vote daily', desc: 'Pick your favorites across all 8 categories. Come back every day as the dynamics shift.' },
            { title: 'Watch the charts', desc: 'Real-time visualizations track public sentiment over the entire month. See if the jury agrees.' },
          ].map((step, i) => (
            <div key={i} className="glass-card p-7 pt-12 relative">
              <div className="absolute -top-4 left-7 font-mono font-extrabold text-3xl neon-cyan">
                {i + 1}
              </div>
              <h3 className="font-bold text-base mb-2">{step.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="neon-divider" />

      {/* CTA */}
      <section className="py-28 text-center">
        <h2 className="font-display font-bold text-[clamp(2.5rem,6vw,5rem)] leading-tight neon-cyan mb-8">
          the arena awaits
        </h2>
        <Link href="/vote" className="glow-btn text-lg !py-5 !px-14">
          Enter the Arena
        </Link>
      </section>

      {selectedParticipant && (
        <ProfileModal
          participant={selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
        />
      )}
    </div>
  )
}
