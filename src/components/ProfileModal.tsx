'use client'

import { Participant } from '@/lib/types'

interface Props {
  participant: Participant
  onClose: () => void
}

const SOCIAL_CONFIG: Record<string, { label: string, urlPrefix?: string, color: string }> = {
  twitter: { label: 'X / Twitter', urlPrefix: 'https://x.com/', color: 'text-neon-cyan' },
  instagram: { label: 'Instagram', urlPrefix: 'https://instagram.com/', color: 'text-neon-pink' },
  youtube: { label: 'YouTube', color: 'text-[#ff4444]' },
  website: { label: 'Website', color: 'text-neon-green' },
  substack: { label: 'Substack', color: 'text-neon-yellow' },
  bandcamp: { label: 'Bandcamp', color: 'text-neon-purple' },
  letterboxd: { label: 'Letterboxd', color: 'text-[#00e054]' },
  tiktok: { label: 'TikTok', urlPrefix: 'https://tiktok.com/@', color: 'text-white' },
  music: { label: 'Music', color: 'text-neon-teal' },
}

function getSocialUrl(key: string, value: string): string {
  const config = SOCIAL_CONFIG[key]
  if (!config) return value
  if (value.startsWith('http')) return value
  return (config.urlPrefix || '') + value
}

export default function ProfileModal({ participant, onClose }: Props) {
  const socialEntries = Object.entries(participant.socials).filter(([, v]) => v)

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="glass-card p-8 max-w-md w-full border-neon-cyan/20 relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-white/30 hover:text-white text-xl transition-colors"
        >
          &times;
        </button>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 bg-white/5 mb-4">
            {participant.photo_url ? (
              <img src={participant.photo_url} alt={participant.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-white/15 font-mono">
                ?
              </div>
            )}
          </div>
          <h2 className="font-bold text-xl text-center">{participant.name}</h2>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25 mb-2">Bio</div>
          <p className="text-sm text-white/60 leading-relaxed">{participant.bio}</p>
        </div>

        {/* Socials */}
        {socialEntries.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25 mb-3">Links</div>
            <div className="flex flex-col gap-2.5">
              {socialEntries.map(([key, value]) => {
                const config = SOCIAL_CONFIG[key] || { label: key, color: 'text-white/50' }
                const url = getSocialUrl(key, value!)
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 transition-all group`}
                  >
                    <span className={`text-sm font-semibold ${config.color} transition-colors`}>
                      {config.label}
                    </span>
                    <span className="text-xs text-white/25 truncate flex-1 text-right group-hover:text-white/40 transition-colors">
                      {value!.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
