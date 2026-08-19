// Fetches live GitHub data and renders a bespoke SVG stats card matching
// the portfolio's obsidian/orange theme - deliberately not a shared
// third-party template (github-readme-stats etc.), so the visual identity
// stays unique to this profile while the numbers stay real and current.

const USERNAME = 'kunal202426'
const TOKEN = process.env.GH_TOKEN

const headers = {
  Accept: 'application/vnd.github+json',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
}

async function fetchJson(url) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return res.json()
}

async function main() {
  const user = await fetchJson(`https://api.github.com/users/${USERNAME}`)

  let repos = []
  let page = 1
  while (true) {
    const batch = await fetchJson(
      `https://api.github.com/users/${USERNAME}/repos?per_page=100&page=${page}&type=owner`,
    )
    repos = repos.concat(batch)
    if (batch.length < 100) break
    page++
  }

  const ownedRepos = repos.filter((r) => !r.fork)
  const totalStars = ownedRepos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)

  const langCounts = {}
  for (const r of ownedRepos) {
    if (!r.language) continue
    langCounts[r.language] = (langCounts[r.language] || 0) + 1
  }
  const topLangs = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const maxLangCount = topLangs.length > 0 ? topLangs[0][1] : 1

  const langColors = {
    JavaScript: '#F7DF1E',
    TypeScript: '#3178C6',
    Python: '#3776AB',
    HTML: '#E34C26',
    CSS: '#563D7C',
    Solidity: '#AA6746',
    Jupyter: '#DA5B0B',
    'Jupyter Notebook': '#DA5B0B',
    Java: '#B07219',
  }
  const barColor = (name) => langColors[name] || '#D4A574'

  const stats = [
    { label: 'PUBLIC REPOS', value: user.public_repos ?? ownedRepos.length },
    { label: 'TOTAL STARS', value: totalStars },
    { label: 'FOLLOWERS', value: user.followers ?? 0 },
  ]

  const barW = 260
  const barGap = 34
  const langBars = topLangs
    .map(([name, count], i) => {
      const y = 78 + i * barGap
      const w = Math.max(10, Math.round((count / maxLangCount) * barW))
      return `
    <text x="480" y="${y - 8}" font-size="12" fill="#D4C4A8" font-family="'Segoe UI', Arial, sans-serif">${name}</text>
    <rect x="480" y="${y}" width="${barW}" height="8" rx="4" fill="#1C1F15"/>
    <rect class="bar bar${i}" x="480" y="${y}" width="${w}" height="8" rx="4" fill="${barColor(name)}"/>`
    })
    .join('')
  const barKeyframes = topLangs
    .map(
      (_, i) =>
        `.bar${i} { transform-box: fill-box; transform-origin: 0% 50%; animation: growBar${i} 0.9s ease-out 0.2s backwards; } @keyframes growBar${i} { from { transform: scaleX(0); } to { transform: scaleX(1); } }`,
    )
    .join('\n      ')

  const statBlocks = stats
    .map(
      (s, i) => `
    <text x="${60 + i * 150}" y="86" font-size="34" font-weight="800" fill="#E8560C" font-family="'Segoe UI', Arial, sans-serif">${s.value}</text>
    <text x="${60 + i * 150}" y="108" font-size="11" letter-spacing="1" fill="#9B8B70" font-family="'Segoe UI', Arial, sans-serif">${s.label}</text>`,
    )
    .join('')

  const svg = `<svg width="900" height="220" viewBox="0 0 900 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      ${barKeyframes}
    </style>
  </defs>
  <rect width="900" height="220" rx="14" fill="#0E0E0B" stroke="#2A2E1F" stroke-width="1.5"/>
  <text x="30" y="34" font-size="13" letter-spacing="2" fill="#E8560C" font-family="Consolas, 'Courier New', monospace" font-weight="700">GITHUB ACTIVITY · LIVE</text>
  <line x1="30" y1="46" x2="870" y2="46" stroke="#2A2E1F" stroke-width="1"/>

  <g>${statBlocks}</g>
  <line x1="440" y1="60" x2="440" y2="190" stroke="#2A2E1F" stroke-width="1"/>
  <text x="480" y="64" font-size="11" letter-spacing="1" fill="#9B8B70" font-family="'Segoe UI', Arial, sans-serif">TOP LANGUAGES</text>
  <g>${langBars}</g>

  <text x="30" y="204" font-size="10" fill="#4A3C2A" font-family="Consolas, 'Courier New', monospace">updated ${new Date().toISOString().slice(0, 10)}</text>
</svg>
`

  const fs = await import('node:fs/promises')
  await fs.mkdir('assets', { recursive: true })
  await fs.writeFile('assets/stats-card.svg', svg, 'utf-8')
  console.log('Wrote assets/stats-card.svg')
  console.log({ stats, topLangs })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
