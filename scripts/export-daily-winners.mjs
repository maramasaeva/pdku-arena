import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const envFile = readFileSync(resolve(root, '.env.local'), 'utf-8')
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()] })
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const PARTICIPANTS = {
  'p-12': 'Messier', 'p-40': 'Kat (the vat)', 'p-1': 'Emily', 'p-2': 'Evan',
  'p-3': 'Ana', 'p-4': 'Michelle Huang', 'p-5': 'Matthew', 'p-6': 'Savannah',
  'p-7': 'Becca', 'p-8': 'Tyler Alterman', 'p-9': 'Eugene', 'p-10': 'Aaron Silverbook',
  'p-11': 'KT', 'p-13': 'Isabel', 'p-14': 'Jessiah', 'p-15': 'Avisha',
  'p-16': 'Francesca (Pixel Surfer)', 'p-17': 'Eliana', 'p-18': 'Elwyn',
  'p-19': 'Justin Kuiper', 'p-20': 'Michelle (mee-chell)', 'p-21': 'Tonchi',
  'p-22': 'Brenda', 'p-23': 'Gai', 'p-24': 'Aryeh', 'p-25': 'Glasha',
  'p-26': 'Charlie Guthmann', 'p-27': 'Christian Gonzalez', 'p-28': 'Aron Fromm',
  'p-29': 'Jeredino Lavagnino', 'p-30': 'Halina', 'p-31': 'Josie',
  'p-32': 'Future Briefing', 'p-33': 'Tess', 'p-34': 'Tanner', 'p-35': 'Oliver',
  'p-36': 'Brogan (Art Chad)', 'p-37': 'Caitlin (Has Questions)',
  'p-38': 'John (Broomhead)', 'p-39': 'Josh', 'p-41': 'Camden',
  'p-43': 'Loan (DD)', 'p-44': 'Jennifer', 'p-45': 'Evie', 'p-46': 'Ali',
  'p-47': 'conq', 'p-48': 'Avalon', 'p-49': 'Xander', 'p-50': 'Kyle', 'p-51': 'Maëlle',
  'p-52': 'Johannes Rolshausen',
}

const CATEGORIES = {
  'fan-favorite': 'Fan Favorite',
  'most-entertaining': 'Most Entertaining',
  'most-likely-to-win': 'Most Likely to Win',
  'best-vibes': 'Best Vibes',
  'best-dressed': 'Best Dressed',
  'most-funny': 'Most Funny',
  'most-chaotic': 'Most Chaotic',
  'god-empress': 'Most Likely to Seduce the Basilisk',
}

async function main() {
  let allVotes = []
  let from = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from('votes')
      .select('vote_date, category_id, participant_id')
      .order('vote_date')
      .range(from, from + pageSize - 1)

    if (error) { console.error('Supabase error:', error); process.exit(1) }
    allVotes = allVotes.concat(data)
    if (data.length < pageSize) break
    from += pageSize
  }

  console.log(`Fetched ${allVotes.length} total votes`)

  if (allVotes.length === 0) {
    console.log('No votes found.')
    return
  }

  // Group: date -> category -> participant -> count
  const grouped = {}
  for (const v of allVotes) {
    const d = v.vote_date
    const c = v.category_id
    const p = v.participant_id
    grouped[d] ??= {}
    grouped[d][c] ??= {}
    grouped[d][c][p] = (grouped[d][c][p] || 0) + 1
  }

  const dates = Object.keys(grouped).sort()

  // === CSV 1: Daily winners (one winner per category per day) ===
  const winnerRows = [['Date', 'Category', 'Winner', 'Votes', 'Total Votes in Category']]
  for (const date of dates) {
    for (const [catId, catName] of Object.entries(CATEGORIES)) {
      const participants = grouped[date]?.[catId]
      if (!participants) continue
      const totalVotes = Object.values(participants).reduce((a, b) => a + b, 0)
      const sorted = Object.entries(participants).sort((a, b) => b[1] - a[1])
      const [winnerId, winnerVotes] = sorted[0]
      const winnerName = PARTICIPANTS[winnerId] || winnerId
      winnerRows.push([date, catName, winnerName, winnerVotes, totalVotes])
    }
  }

  const winnerCsv = winnerRows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const winnerPath = resolve(root, 'exports', 'daily-winners.csv')

  // === CSV 2: Full breakdown (all votes per participant per category per day) ===
  const fullRows = [['Date', 'Category', 'Participant', 'Votes']]
  for (const date of dates) {
    for (const [catId, catName] of Object.entries(CATEGORIES)) {
      const participants = grouped[date]?.[catId]
      if (!participants) continue
      const sorted = Object.entries(participants).sort((a, b) => b[1] - a[1])
      for (const [pid, count] of sorted) {
        fullRows.push([date, catName, PARTICIPANTS[pid] || pid, count])
      }
    }
  }

  const fullCsv = fullRows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const fullPath = resolve(root, 'exports', 'full-breakdown.csv')

  // Write files
  const { mkdirSync } = await import('fs')
  mkdirSync(resolve(root, 'exports'), { recursive: true })
  writeFileSync(winnerPath, winnerCsv)
  writeFileSync(fullPath, fullCsv)

  console.log(`\nWrote ${winnerRows.length - 1} rows to exports/daily-winners.csv`)
  console.log(`Wrote ${fullRows.length - 1} rows to exports/full-breakdown.csv`)

  // Print summary to console
  console.log('\n=== DAILY WINNERS SUMMARY ===\n')
  let currentDate = ''
  for (const row of winnerRows.slice(1)) {
    if (row[0] !== currentDate) {
      currentDate = row[0]
      console.log(`\n--- ${currentDate} ---`)
    }
    console.log(`  ${row[1]}: ${row[2]} (${row[3]} votes)`)
  }
}

main()
