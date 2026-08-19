// Renders the Tech Arsenal as one dark, bordered SVG card (matching the
// hero/terminal/timeline assets) with hand-drawn colored pills per
// technology - no external image references. GitHub serves raw SVG files
// with `Content-Security-Policy: default-src 'none'`, which blocks ANY
// external resource load from inside the SVG (confirmed: an earlier
// version embedding shields.io badges via <image href> rendered as a
// broken 0x0 image). Every other asset in this repo already worked
// specifically because it's pure vector shapes + text with zero external
// fetches - this one now follows the same rule.

const CARD_WIDTH = 900
const PADDING = 30
const CONTENT_WIDTH = CARD_WIDTH - PADDING * 2
const PILL_HEIGHT = 30
const PILL_GAP = 10
const ROW_GAP = 12
const CATEGORY_GAP = 32
const FONT_SIZE = 13
const CHAR_WIDTH = 7.6 // estimate for bold 13px sans-serif, no canvas available
const PILL_H_PADDING = 16

const categories = [
  {
    label: '💻 FULL STACK DEVELOPMENT',
    items: [
      ['React', '20232A', '#61DAFB'],
      ['TypeScript', '007ACC', '#FFFFFF'],
      ['Next.js', '111111', '#FFFFFF'],
      ['Node.js', '339933', '#FFFFFF'],
      ['Express.js', '2E2E2E', '#FFFFFF'],
      ['Tailwind CSS', '38B2AC', '#FFFFFF'],
      ['Three.js', '1A1A1A', '#FFFFFF'],
    ],
  },
  {
    label: '🤖 AI / ML & DATA',
    items: [
      ['Python', '3776AB', '#FFFFFF'],
      ['FastAPI', '009688', '#FFFFFF'],
      ['PyTorch', 'EE4C2C', '#FFFFFF'],
      ['TensorFlow', 'FF6F00', '#FFFFFF'],
      ['scikit-learn', 'F7931E', '#1A1208'],
      ['Pandas', '150458', '#FFFFFF'],
    ],
  },
  {
    label: '⛓️ BLOCKCHAIN',
    items: [
      ['Solidity', '363636', '#FFFFFF'],
      ['Hardhat', 'F7DF1E', '#1A1208'],
      ['Ethereum', '3C3C3D', '#FFFFFF'],
      ['MetaMask', 'F6851B', '#FFFFFF'],
    ],
  },
  {
    label: '☁️ INFRA & TOOLS',
    items: [
      ['Docker', '2496ED', '#FFFFFF'],
      ['PostgreSQL', '316192', '#FFFFFF'],
      ['MongoDB', '47A248', '#FFFFFF'],
      ['Redis', 'DC382D', '#FFFFFF'],
      ['Vercel', '000000', '#FFFFFF'],
      ['Git', 'F05032', '#FFFFFF'],
    ],
  },
]

function pillWidth(name) {
  return Math.round(name.length * CHAR_WIDTH + PILL_H_PADDING * 2)
}

function layoutRows(items) {
  const rows = []
  let row = []
  let rowWidth = 0
  for (const item of items) {
    const w = item.width
    if (rowWidth + (row.length > 0 ? PILL_GAP : 0) + w > CONTENT_WIDTH && row.length > 0) {
      rows.push(row)
      row = []
      rowWidth = 0
    }
    row.push(item)
    rowWidth += (row.length > 1 ? PILL_GAP : 0) + w
  }
  if (row.length > 0) rows.push(row)
  return rows
}

function main() {
  const categoryBlocks = categories.map((cat) => {
    const items = cat.items.map(([name, bg, text]) => ({ name, bg, text, width: pillWidth(name) }))
    return { label: cat.label, rows: layoutRows(items) }
  })

  let y = PADDING + 4
  const parts = []
  for (const block of categoryBlocks) {
    parts.push(
      `<text x="${PADDING}" y="${y + 12}" font-size="13" font-weight="700" letter-spacing="1.5" fill="#E8560C" font-family="Consolas, 'Courier New', monospace">${block.label}</text>`,
    )
    y += 32
    for (const row of block.rows) {
      let x = PADDING
      for (const item of row) {
        parts.push(
          `<rect x="${x}" y="${y}" width="${item.width}" height="${PILL_HEIGHT}" rx="15" fill="#${item.bg}"/>` +
            `<text x="${x + item.width / 2}" y="${y + PILL_HEIGHT / 2 + 4.5}" text-anchor="middle" font-size="${FONT_SIZE}" font-weight="700" fill="${item.text}" font-family="'Segoe UI', Arial, sans-serif">${item.name}</text>`,
        )
        x += item.width + PILL_GAP
      }
      y += PILL_HEIGHT + ROW_GAP
    }
    y += CATEGORY_GAP - ROW_GAP
  }
  const cardHeight = Math.round(y + PADDING - CATEGORY_GAP + ROW_GAP)

  const svg = `<svg width="${CARD_WIDTH}" height="${cardHeight}" viewBox="0 0 ${CARD_WIDTH} ${cardHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${CARD_WIDTH}" height="${cardHeight}" rx="14" fill="#0E0E0B" stroke="#2A2E1F" stroke-width="1.5"/>
  ${parts.join('\n  ')}
</svg>
`

  return svg
}

const svg = main()
const fs = await import('node:fs/promises')
await fs.mkdir('assets', { recursive: true })
await fs.writeFile('assets/tech-arsenal.svg', svg, 'utf-8')
console.log('Wrote assets/tech-arsenal.svg')
