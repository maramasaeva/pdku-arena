'use client'

import { Participant } from '@/lib/types'

interface Props {
  participant: Participant
  rank?: number
  percentage?: number
  onVote?: () => void
  voted?: boolean
  showVoteButton?: boolean
  compact?: boolean
}

export default function ParticipantCard({
  participant,
  rank,
  percentage,
  onVote,
  voted,
  showVoteButton,
  compact,
}: Props) {
  return (
    <div className={`glass-card p-4 ${compact ? 'p-3' : 'p-5'} relative group`}>
      {rank !== undefined && (
        <div className="absolute -top-3 -left-1 font-mono font-bold text-2xl neon-cyan z-10">
          #{rank}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-xl overflow-hidden border-2 border-white/10 group-hover:border-neon-cyan/40 transition-colors flex-shrink-0 bg-white/5`}>
          {participant.photo_url ? (
            <img
              src={participant.photo_url}
              alt={participant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-white/20">
              ?
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-bold ${compact ? 'text-sm' : 'text-base'} truncate`}>
            {participant.name}
          </h3>
          {!compact && participant.bio && (
            <p className="text-xs text-white/40 mt-0.5 line-clamp-2">
              {participant.bio}
            </p>
          )}
          {participant.socials && Object.keys(participant.socials).length > 0 && (
            <div className="flex gap-2 mt-1.5">
              {participant.socials.twitter && (
                <a
                  href={`https://x.com/${participant.socials.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/30 hover:text-neon-cyan transition-colors"
                >
                  @{participant.socials.twitter}
                </a>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {percentage !== undefined && (
            <div className="text-right">
              <div className="font-mono font-bold text-lg neon-cyan">
                {percentage.toFixed(1)}%
              </div>
            </div>
          )}

          {showVoteButton && (
            <button
              onClick={onVote}
              disabled={voted}
              className={`
                text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full
                transition-all duration-200
                ${voted
                  ? 'bg-neon-cyan/20 text-neon-cyan cursor-default vote-confirmed'
                  : 'bg-white/5 text-white/60 hover:bg-neon-cyan hover:text-black hover:shadow-[0_0_20px_rgba(31,196,255,0.3)]'
                }
              `}
            >
              {voted ? '✓' : 'Vote'}
            </button>
          )}
        </div>
      </div>

      {percentage !== undefined && (
        <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${percentage}%`,
              background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-pink))',
              boxShadow: '0 0 10px rgba(31,196,255,0.3)',
            }}
          />
        </div>
      )}
    </div>
  )
}
