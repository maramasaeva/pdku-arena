'use client'

import { useState, useEffect, useMemo } from 'react'
import { PARTICIPANTS, POLL_CATEGORIES, NEON_COLORS } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import ParticipantCard from '@/components/ParticipantCard'
import ProfileModal from '@/components/ProfileModal'
import type { Participant } from '@/lib/types'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts'

type ViewMode = 'bar' | 'pie' | 'trend'

export default function LeaderboardPage() {
  const [activeCategory, setActiveCategory] = useState(POLL_CATEGORIES[0].id)
  const [viewMode, setViewMode] = useState<ViewMode>('bar')
  const [results, setResults] = useState<Record<string, Record<string, number>>>({})
  const [trendData, setTrendData] = useState<Record<string, string | number>[]>([])
  const [showJury, setShowJury] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Participant | null>(null)

  useEffect(() => {
    loadResults()
    loadTrendData()
  }, [])

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
      // DB not set up yet — generate demo data
      generateDemoData()
    }
  }

  function generateDemoData() {
    const demo: Record<string, Record<string, number>> = {}
    for (const cat of POLL_CATEGORIES) {
      demo[cat.id] = {}
      for (const p of PARTICIPANTS) {
        demo[cat.id][p.id] = Math.floor(Math.random() * 100) + 5
      }
    }
    setResults(demo)

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split('T')[0]
    })
    const trend = days.map(date => {
      const entry: Record<string, number> = {}
      for (const p of PARTICIPANTS) {
        entry[p.id] = Math.floor(Math.random() * 50) + 10
      }
      return { date, ...entry }
    })
    setTrendData(trend)
  }

  async function loadTrendData() {
    try {
      const { data } = await supabase
        .from('votes')
        .select('vote_date, participant_id, category_id')
      if (!data || data.length === 0) return

      const byDate: Record<string, Record<string, number>> = {}
      for (const vote of data) {
        if (!byDate[vote.vote_date]) byDate[vote.vote_date] = {}
        byDate[vote.vote_date][vote.participant_id] =
          (byDate[vote.vote_date][vote.participant_id] || 0) + 1
      }
      const trend = Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, counts]) => ({ date, ...counts }))
      setTrendData(trend)
    } catch {
      // Demo data already generated
    }
  }

  const chartData = useMemo(() => {
    const catResults = results[activeCategory] || {}
    const total = Object.values(catResults).reduce((a, b) => a + b, 0)
    return PARTICIPANTS
      .map(p => ({
        name: p.name,
        id: p.id,
        votes: catResults[p.id] || 0,
        pct: total > 0 ? ((catResults[p.id] || 0) / total) * 100 : 0,
      }))
      .sort((a, b) => b.votes - a.votes)
  }, [results, activeCategory])

  const activeCat = POLL_CATEGORIES.find(c => c.id === activeCategory)!

  return (
    <div className="min-h-screen pt-16 pb-12">
      <div className="mb-12">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30 mb-3">
          Live Results
        </div>
        <h1 className="font-display font-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight neon-pink mb-3">
          leaderboard
        </h1>
        <p className="text-sm text-white/40 leading-relaxed">
          Real-time sentiment tracking across all categories.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-10 -mx-2 px-2">
        {POLL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              flex-shrink-0 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider
              transition-all duration-200 border
              ${activeCategory === cat.id
                ? 'bg-neon-pink text-black border-neon-pink shadow-[0_0_20px_rgba(255,31,184,0.2)]'
                : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:border-white/20 hover:text-white/60'
              }
            `}
          >
            <span className="mr-1.5">{cat.icon}</span>
            <span className="hidden sm:inline">{cat.name}</span>
            <span className="sm:hidden">{cat.icon}</span>
          </button>
        ))}
      </div>

      {/* View mode toggles */}
      <div className="flex gap-3 mb-10">
        {([
          { mode: 'bar' as const, label: 'Bar Chart' },
          { mode: 'pie' as const, label: 'Pie Chart' },
          { mode: 'trend' as const, label: 'Trend' },
        ]).map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider
              transition-all duration-200
              ${viewMode === mode
                ? 'bg-white/10 text-white'
                : 'text-white/30 hover:text-white/50'
              }
            `}
          >
            {label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setShowJury(!showJury)}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider
            transition-all duration-200 border
            ${showJury
              ? 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30'
              : 'text-white/30 border-white/10 hover:text-white/50'
            }
          `}
        >
          {showJury ? 'Jury ON' : 'Jury'}
        </button>
      </div>

      {/* Visualization */}
      <div className="glass-card p-8 mb-10">
        <h2 className="font-bold text-base mb-2 flex items-center gap-2">
          <span>{activeCat.icon}</span> {activeCat.name}
        </h2>
        <p className="text-xs text-white/30 mb-8">{activeCat.description}</p>

        <div className="w-full h-[350px] md:h-[400px]">
          {viewMode === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 60, right: 20, top: 5, bottom: 5 }}>
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10,10,15,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [`${value} votes`, 'Votes']}
                />
                <Bar
                  dataKey="votes"
                  radius={[0, 6, 6, 0]}
                  fill="url(#barGradient)"
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1fc4ff" />
                    <stop offset="100%" stopColor="#ff1fb8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}

          {viewMode === 'pie' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="votes"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="75%"
                  innerRadius="45%"
                  strokeWidth={2}
                  stroke="rgba(10,10,15,0.8)"
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={NEON_COLORS[i % NEON_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10,10,15,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}

          {viewMode === 'trend' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  tickFormatter={(d: string) => d.slice(5)}
                />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10,10,15,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                {PARTICIPANTS.map((p, i) => (
                  <Line
                    key={p.id}
                    type="monotone"
                    dataKey={p.id}
                    name={p.name}
                    stroke={NEON_COLORS[i % NEON_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Jury comparison */}
      {showJury && (
        <div className="glass-card p-6 mb-8 border-neon-yellow/20">
          <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
            <span>&#9878;</span> Jury vs Audience
          </h3>
          <p className="text-xs text-white/30 mb-4">
            How does the jury&apos;s vote compare to the public? Jury votes are revealed weekly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-neon-cyan/60 mb-3">
                Audience
              </div>
              {chartData.slice(0, 3).map((d, i) => (
                <div key={d.id} className="flex items-center gap-3 mb-2">
                  <span className="font-mono font-bold text-neon-cyan text-sm">#{i + 1}</span>
                  <span className="text-sm">{d.name}</span>
                  <span className="font-mono text-xs text-white/40 ml-auto">{d.pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-neon-yellow/60 mb-3">
                Jury
              </div>
              <p className="text-xs text-white/20 italic">Jury votes will appear here once cast.</p>
            </div>
          </div>
        </div>
      )}

      {/* Ranked list */}
      <div className="max-w-4xl">
        <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30 mb-6">
          Rankings &mdash; {activeCat.name}
        </h3>
        <div className="grid gap-5 stagger-children">
          {chartData.map((d, i) => {
            const participant = PARTICIPANTS.find(p => p.id === d.id)!
            return (
              <ParticipantCard
                key={d.id}
                participant={participant}
                rank={i + 1}
                percentage={d.pct}
                compact
                onProfileClick={() => setSelectedProfile(participant)}
              />
            )
          })}
        </div>
      </div>

      {selectedProfile && (
        <ProfileModal participant={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}
    </div>
  )
}
