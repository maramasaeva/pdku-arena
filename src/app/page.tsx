'use client'

import Link from 'next/link'
import { PARTICIPANTS, POLL_CATEGORIES } from '@/lib/data'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-[6vw] py-24">
        <div className="font-mono text-xs tracking-[0.25em] uppercase text-neon-teal/60 mb-6">
          plzdontkillus &mdash; berkeley, july 2026
        </div>

        <h1 className="font-display font-bold text-[clamp(3.5rem,12vw,10rem)] leading-[0.95] tracking-tighter mb-6">
          <span className="neon-cyan">pdku</span>
          <span className="neon-pink">:</span>
          <br className="sm:hidden" />
          <span className="neon-yellow">arena</span>
        </h1>

        <p className="text-[clamp(1rem,2vw,1.3rem)] font-light max-w-lg leading-relaxed text-white/50 mb-4">
          The <strong className="font-semibold text-neon-cyan">people&apos;s court</strong> decides.
          Vote daily. Track sentiment. See who the audience loves
          &mdash; and whether the <em className="text-neon-pink font-normal">jury</em> agrees.
        </p>

        <div className="font-mono text-xs tracking-[0.15em] uppercase text-neon-green/50 mb-10">
          real-time polls <span className="mx-2 opacity-30">/</span>
          live visualizations <span className="mx-2 opacity-30">/</span>
          {POLL_CATEGORIES.length} categories
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
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
      <section className="py-20 px-[6vw]">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30 mb-3">
          Poll Categories
        </div>
        <h2 className="font-display font-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight neon-cyan mb-2">
          8 ways to judge
        </h2>
        <p className="text-sm text-white/40 max-w-md mb-10">
          Vote in every category, every day. Your voice shapes the leaderboard.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {POLL_CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={`/vote#${cat.slug}`}
              className="glass-card p-5 fade-in-up group"
            >
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h3 className="font-bold text-sm mb-1 group-hover:text-neon-cyan transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-white/35">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="neon-divider" />

      {/* Participants Grid */}
      <section className="py-20 px-[6vw]">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30 mb-3">
          The Contestants
        </div>
        <h2 className="font-display font-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight neon-pink mb-2">
          who enters the arena?
        </h2>
        <p className="text-sm text-white/40 max-w-md mb-10">
          The creators of plzdontkillus. Profiles and photos coming soon.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 stagger-children">
          {PARTICIPANTS.map((p, i) => (
            <div key={p.id} className="glass-card p-4 text-center fade-in-up group">
              <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden border-2 border-white/10 group-hover:border-neon-cyan/40 transition-colors bg-white/5 mb-3">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-white/10">
                    {i + 1}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-sm">{p.name}</h3>
              <p className="text-xs text-white/30 mt-1">{p.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="neon-divider" />

      {/* How it works */}
      <section className="py-20 px-[6vw]">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30 mb-3">
          How It Works
        </div>
        <h2 className="font-display font-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight neon-yellow mb-10">
          cast judgment
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {[
            { title: 'Sign in', desc: 'One-click with Google or X. We only use it to keep votes honest — one vote per person per day.' },
            { title: 'Vote daily', desc: 'Pick your favorites across all 8 categories. Come back every day as the dynamics shift.' },
            { title: 'Watch the charts', desc: 'Real-time visualizations track public sentiment over the entire month. See if the jury agrees.' },
          ].map((step, i) => (
            <div key={i} className="glass-card p-6 pt-10 relative">
              <div className="absolute -top-4 left-6 font-mono font-extrabold text-3xl neon-cyan">
                {i + 1}
              </div>
              <h3 className="font-bold text-base mb-2">{step.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-[6vw] text-center">
        <h2 className="font-display font-bold text-[clamp(2.5rem,6vw,5rem)] leading-tight neon-cyan mb-6">
          the arena awaits
        </h2>
        <Link href="/vote" className="glow-btn text-lg !py-5 !px-14">
          Enter the Arena
        </Link>
      </section>
    </div>
  )
}
