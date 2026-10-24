import { mkdir } from "node:fs/promises"
import { join } from "node:path"
import { chromium } from "playwright-core"

const BASE = process.env.OG_BASE ?? "http://localhost:3005"
const OUT = join(process.cwd(), "public", "og")
const SLUGS = [
  "home",
  "character-flow",
  "dithering",
  "low-res-video",
  "style-flow",
  "anti-aliasing",
  "future-table",
  "concept-chat",
  "tanstack-showcase",
]

const FREEZE = `
  body > :not(:first-child) { display: none !important; }
  .preview-wipe { animation: none !important; clip-path: inset(0 50% 0 0) !important; }
`

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch({ channel: "chrome" })
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
  colorScheme: "dark",
})

for (const slug of SLUGS) {
  await page.goto(`${BASE}/og/${slug}`, { waitUntil: "domcontentloaded" })
  await page.waitForSelector("[data-og-card]")
  await page.addStyleTag({ content: FREEZE })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(2600)
  const file = join(OUT, slug === "home" ? "../og.png" : `${slug}.png`)
  await page.screenshot({
    path: file,
    clip: { x: 0, y: 0, width: 1200, height: 630 },
    animations: "disabled",
  })
  console.log(`[og] ${slug}`)
}

await browser.close()
