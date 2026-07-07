import puppeteer from 'puppeteer'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function parseCsv(text) {
  return text.trim().split('\n').map(line =>
    line.match(/"([^"]*)"/g).map(m => m.slice(1, -1))
  )
}

const winnerData = parseCsv(readFileSync(resolve(root, 'exports/daily-winners.csv'), 'utf-8'))
const fullData = parseCsv(readFileSync(resolve(root, 'exports/full-breakdown.csv'), 'utf-8'))

const categoryIcons = {
  'Fan Favorite': '⭐',
  'Most Entertaining': '🎭',
  'Most Likely to Win': '🏆',
  'Best Vibes': '✨',
  'Best Dressed': '👗',
  'Most Funny': '😂',
  'Most Chaotic': '🔥',
  'Most Likely to Seduce the Basilisk': '👑',
}

const style = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; padding: 40px; }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; letter-spacing: -0.5px; }
  .subtitle { font-size: 12px; color: #666; margin-bottom: 28px; }
  h2 { font-size: 15px; font-weight: 600; margin: 24px 0 8px; padding: 6px 10px;
       background: #111; color: #fff; border-radius: 4px; display: inline-block; }
  h2:first-of-type { margin-top: 0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
  th { text-align: left; padding: 6px 8px; border-bottom: 2px solid #111; font-weight: 600;
       font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #555; }
  td { padding: 5px 8px; border-bottom: 1px solid #e5e5e5; }
  tr:last-child td { border-bottom: none; }
  .winner-name { font-weight: 600; }
  .votes { color: #666; font-variant-numeric: tabular-nums; }
  .rank-1 { background: #fffbe6; }
  .rank-1 .winner-name { color: #b8860b; }
  .cat-icon { margin-right: 4px; }
  .page-break { page-break-before: always; }
  .footer { margin-top: 32px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #e5e5e5; padding-top: 12px; }
`

// === PDF 1: Daily Winners ===
function buildWinnersHtml() {
  const rows = winnerData.slice(1)
  const byDate = {}
  for (const [date, cat, winner, votes, total] of rows) {
    byDate[date] ??= []
    byDate[date].push({ cat, winner, votes, total })
  }

  let html = `<html><head><style>${style}</style></head><body>`
  html += `<h1>PDKU Arena — Daily Winners</h1>`
  html += `<div class="subtitle">plzdontkillus Season 1 · July 2026 · Audience votes · Generated ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>`

  const dates = Object.keys(byDate).sort()
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i]
    const formatted = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    if (i > 0 && i % 3 === 0) html += `<div class="page-break"></div>`
    html += `<h2>${formatted}</h2>`
    html += `<table><thead><tr><th>Category</th><th>Winner</th><th>Votes</th><th>Total</th></tr></thead><tbody>`
    for (const { cat, winner, votes, total } of byDate[date]) {
      const icon = categoryIcons[cat] || ''
      html += `<tr><td><span class="cat-icon">${icon}</span>${cat}</td><td class="winner-name">${winner}</td><td class="votes">${votes}</td><td class="votes">${total}</td></tr>`
    }
    html += `</tbody></table>`
  }
  html += `<div class="footer">pdku-arena.vercel.app</div></body></html>`
  return html
}

// === PDF 2: Full Breakdown ===
function buildBreakdownHtml() {
  const rows = fullData.slice(1)
  // Group: date -> category -> [{participant, votes}]
  const grouped = {}
  for (const [date, cat, participant, votes] of rows) {
    grouped[date] ??= {}
    grouped[date][cat] ??= []
    grouped[date][cat].push({ participant, votes: parseInt(votes) })
  }

  let html = `<html><head><style>${style}
    .cat-section { margin-bottom: 12px; }
    .cat-title { font-size: 11px; font-weight: 600; color: #333; margin: 8px 0 2px; }
  </style></head><body>`
  html += `<h1>PDKU Arena — Full Vote Breakdown</h1>`
  html += `<div class="subtitle">plzdontkillus Season 1 · July 2026 · All audience votes by participant · Generated ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>`

  const dates = Object.keys(grouped).sort()
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i]
    const formatted = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    if (i > 0) html += `<div class="page-break"></div>`
    html += `<h2>${formatted}</h2>`

    const categories = Object.keys(grouped[date])
    for (const cat of categories) {
      const entries = grouped[date][cat]
      const icon = categoryIcons[cat] || ''
      html += `<div class="cat-section">`
      html += `<div class="cat-title"><span class="cat-icon">${icon}</span> ${cat}</div>`
      html += `<table><thead><tr><th style="width:50%">Participant</th><th>Votes</th></tr></thead><tbody>`
      for (let j = 0; j < entries.length; j++) {
        const { participant, votes } = entries[j]
        const cls = j === 0 ? ' class="rank-1"' : ''
        html += `<tr${cls}><td class="winner-name">${participant}</td><td class="votes">${votes}</td></tr>`
      }
      html += `</tbody></table></div>`
    }
  }
  html += `<div class="footer">pdku-arena.vercel.app</div></body></html>`
  return html
}

async function main() {
  mkdirSync(resolve(root, 'exports'), { recursive: true })

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  const winnersHtml = buildWinnersHtml()
  await page.setContent(winnersHtml, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.pdf({
    path: resolve(root, 'exports/daily-winners.pdf'),
    format: 'A4',
    margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' },
    printBackground: true,
  })
  console.log('Wrote exports/daily-winners.pdf')

  const breakdownHtml = buildBreakdownHtml()
  await page.setContent(breakdownHtml, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.pdf({
    path: resolve(root, 'exports/full-breakdown.pdf'),
    format: 'A4',
    margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' },
    printBackground: true,
  })
  console.log('Wrote exports/full-breakdown.pdf')

  await browser.close()
}

main()
