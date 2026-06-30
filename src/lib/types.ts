export interface Participant {
  id: string
  name: string
  bio: string
  photo_url: string
  socials: {
    twitter?: string
    instagram?: string
    website?: string
    tiktok?: string
  }
}

export interface PollCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  colorClass: string
}

export interface VoteResult {
  participant_id: string
  category_id: string
  vote_count: number
  percentage: number
}

export interface DailyTrend {
  date: string
  [participantId: string]: number | string
}

export interface JuryVote {
  juror_name: string
  participant_id: string
  category_id: string
}
