// Renders the Tech Arsenal as one dark, bordered SVG card (matching the
// hero/terminal/timeline/stats-card assets) instead of loose badge rows
// sitting directly on GitHub's page background - real shields.io badge
// images are embedded via <image> so the recognizable brand icons stay,
// they just get measured (real pixel widths, fetched from each badge's own
// SVG) and packed into a proper grid instead of relying on browser text
// reflow, which is what made the old version feel like a plain list.

const CARD_WIDTH = 900
const PADDING = 30
const CONTENT_WIDTH = CARD_WIDTH - PADDING * 2
const BADGE_HEIGHT = 28
const BADGE_GAP = 8
const ROW_GAP = 14
const CATEGORY_GAP = 34

const categories = [
  {
    label: '💻 FULL STACK DEVELOPMENT',
    badges: [
      ['React', '20232A', 'react', '61DAFB'],
      ['TypeScript', '007ACC', 'typescript', 'white'],
      ['Next.js', '000000', 'next.js', 'white'],
      ['Node.js', '339933', 'nodedotjs', 'white'],
      ['Express.js', '000000', 'express', 'white'],
      ['Tailwind_CSS', '38B2AC', 'tailwind-css', 'white'],
      ['Three.js', '000000', 'three.js', 'white'],
    ],
  },
  {
    label: '🤖 AI / ML & DATA',
    badges: [
      ['Python', '3776AB', 'python', 'white'],
      ['FastAPI', '009688', 'fastapi', 'white'],
      ['PyTorch', 'EE4C2C', 'pytorch', 'white'],
      ['TensorFlow', 'FF6F00', 'tensorflow', 'white'],
      ['scikit--learn', 'F7931E', 'scikit-learn', 'white'],
      ['Pandas', '150458', 'pandas', 'white'],
    ],
  },
  {
    label: '⛓️ BLOCKCHAIN',
    badges: [
      ['Solidity', '363636', 'solidity', 'white'],
      ['Hardhat', 'F7DF1E', 'hardhat', 'black'],
      ['Ethereum', '3C3C3D', 'ethereum', 'white'],
      ['MetaMask', 'F6851B', 'metamask', 'white'],
    ],
  },
  {
    label: '☁️ INFRA & TOOLS',
    badges: [
      ['Docker', '2496ED', 'docker', 'white'],
      ['PostgreSQL', '316192', 'postgresql', 'white'],
      ['MongoDB', '47A248', 'mongodb', 'white'],
      ['Redis', 'DC382D', 'redis', 'white'],
      ['Vercel', '000000', 'vercel', 'white'],
      ['Git', 'F05032', 'git', 'white'],
    ],
  },
]

function badgeUrl([label, color, logo, logoColor]) {
  return `https://img.shields.io/badge/${label}-${color}?style=for-the-badge&logo=${logo}&logoColor=${logoColor}`
}

async function measureBadge(url) {
  const res = await fetch(url)
  const svg = await res.text()
  const m = svg.match(/width="([\d.]+)"/)
  const width = m ? parseFloat(m[1]) : 120
  return Math.round((width / (svg.match(/height="([\d.]+)"/) ? parseFloat(svg.match(/height="([\d.]+)"/)[1]) : 28)) * BADGE_HEIGHT)
}

function layoutRows(items) {
  const rows = []
  let row = []
  let rowWidth = 0
  for (const item of items) {
    const w = item.width
    if (rowWidth + (row.length > 0 ? BADGE_GAP : 0) + w > CONTENT_WIDTH && row.length > 0) {
      rows.push(row)
      row = []
      rowWidth = 0
    }
    row.push(item)
    rowWidth += (row.length > 1 ? BADGE_GAP : 0) + w
  }
  if (row.length > 0) rows.push(row)
  return rows
}

async function main() {
  const categoryBlocks = []
  for (const cat of categories) {
    const items = []
    for (const b of cat.badges) {
      const url = badgeUrl(b)
      const width = await measureBadge(url)
      items.push({ url, width })
    }
    const rows = layoutRows(items)
    categoryBlocks.push({ label: cat.label, rows })
  }

  let y = PADDING + 4
  const svgParts = []
  for (const block of categoryBlocks) {
    svgParts.push(
      `<text x="${PADDING}" y="${y + 12}" font-size="13" font-weight="700" letter-spacing="1.5" fill="#E8560C" font-family="Consolas, 'Courier New', monospace">${block.label}</text>`,
    )
    y += 30
    for (const row of block.rows) {
      let x = PADDING
      for (const item of row) {
        svgParts.push(`<image href="${item.url}" x="${x}" y="${y}" width="${item.width}" height="${BADGE_HEIGHT}"/>`)
        x += item.width + BADGE_GAP
      }
      y += BADGE_HEIGHT + ROW_GAP
    }
    y += CATEGORY_GAP - ROW_GAP
  }
  const cardHeight = y + PADDING - CATEGORY_GAP + ROW_GAP

  const svg = `<svg width="${CARD_WIDTH}" height="${Math.round(cardHeight)}" viewBox="0 0 ${CARD_WIDTH} ${Math.round(cardHeight)}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${CARD_WIDTH}" height="${Math.round(cardHeight)}" rx="14" fill="#0E0E0B" stroke="#2A2E1F" stroke-width="1.5"/>
  ${svgParts.join('\n  ')}
</svg>
`

  const fs = await import('node:fs/promises')
  await fs.mkdir('assets', { recursive: true })
  await fs.writeFile('assets/tech-arsenal.svg', svg, 'utf-8')
  console.log('Wrote assets/tech-arsenal.svg, height=', cardHeight)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
