import { mkdir } from "node:fs/promises"
import path from "node:path"
import type { Page } from "playwright"

// The app's "smooth" ease, inlined because the script runs outside Vite and
// can't import from src/ without the `@/` alias.
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

export const ZOOM_MS = 2500
export const FADE_MS = 800

/**
 * Everything that isn't the tool goes away: the sidebar overlay, the inset
 * header, the floating control panels, the intro copy, the devtools button and
 * the loupe's selection box. The ToolIntro is matched by its h1 rather than a
 * class so a copy tweak can't un-hide it.
 * Scrollbars would otherwise show up as a white sliver once a zoomed target
 * overflows the viewport.
 */
const STAGE_CSS = `
  [data-slot="sidebar-container"],
  [data-slot="sidebar"],
  [data-slot="sidebar-inset"] > header,
  div:has(> h1),
  [data-testid="tanstack_devtools"],
  main .cursor-move,
  .fixed.top-4.right-4 { display: none !important }
  html, body { background: #000 !important; overflow: hidden !important }
  * { scrollbar-width: none !important }
  *::-webkit-scrollbar { display: none !important }
  #reel-vignette {
    position: fixed; inset: 0; z-index: 9998; pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%);
    opacity: 0; transition: opacity ${FADE_MS}ms ${EASE};
  }
  #reel-beat {
    position: fixed; left: 50%; bottom: 10%; z-index: 9999; pointer-events: none;
    transform: translate(-50%, 12px);
    font: 600 44px/1.1 "Inter Variable", system-ui, sans-serif;
    letter-spacing: -0.02em; color: #fff; white-space: nowrap;
    text-shadow: 0 2px 24px rgba(0,0,0,0.9);
    opacity: 0;
    transition: opacity ${FADE_MS}ms ${EASE}, transform ${FADE_MS}ms ${EASE};
  }
  #reel-vignette.on { opacity: 1 }
  #reel-beat.on { opacity: 1; transform: translate(-50%, 0) }
`

let keyframeDir = "/tmp/webfun-reel"

export function setKeyframeDir(dir: string) {
  keyframeDir = dir
}

/**
 * Registered before navigation so the stage CSS is in the document before
 * React paints — otherwise the first frames of every clip show the sidebar
 * and panels flashing out of existence.
 */
export function stageInitScript() {
  return `document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement("style")
    style.id = "reel-stage"
    style.textContent = ${JSON.stringify(STAGE_CSS)}
    document.head.appendChild(style)
  })`
}

export async function prepareStage(page: Page) {
  await page.evaluate(() => {
    for (const id of ["reel-vignette", "reel-beat"]) {
      const el = document.createElement("div")
      el.id = id
      document.body.appendChild(el)
    }
  })
  // Fonts and the injected transitions need a frame to settle before the
  // recording's first visible frame, or the clip opens on a flash.
  await hold(page, 300)
}

export function hold(page: Page, ms: number) {
  return page.waitForTimeout(ms)
}

/**
 * Screenshots are the debugging fallback when a clip comes out wrong: they
 * show what the page looked like at the moment the script thought the beat
 * was happening. Kept out of the repo on purpose.
 */
export async function keyframe(page: Page, name: string) {
  await mkdir(keyframeDir, { recursive: true })
  await page.screenshot({ path: path.join(keyframeDir, `${name}.png`) })
}

/** Scale `selector` over `ms`; `ms: 0` snaps so a clip can open already zoomed. */
export async function zoom(
  page: Page,
  selector: string,
  scale: number,
  ms = ZOOM_MS
) {
  await page.evaluate(
    (args) => {
      const el = document.querySelector<HTMLElement>(args.selector)
      if (!el) throw new Error(`zoom target not found: ${args.selector}`)
      el.style.transformOrigin = "center center"
      el.style.willChange = "transform"
      el.style.transition =
        args.ms > 0 ? `transform ${args.ms}ms ${args.ease}` : "none"
      el.style.transform = `scale(${args.scale})`
    },
    { selector, scale, ms, ease: EASE }
  )
  await hold(page, ms)
}

async function setOverlay(page: Page, on: boolean, text?: string) {
  await page.evaluate(
    (args) => {
      const beat = document.getElementById("reel-beat")
      const vignette = document.getElementById("reel-vignette")
      if (!beat || !vignette) return
      if (args.text !== undefined) beat.textContent = args.text
      beat.classList.toggle("on", args.on)
      vignette.classList.toggle("on", args.on)
    },
    { on, text }
  )
  await hold(page, FADE_MS)
}

export function showBeat(page: Page, text: string) {
  return setOverlay(page, true, text)
}

export function hideBeat(page: Page) {
  return setOverlay(page, false)
}

/**
 * The placeholder arc every tool starts with: settle, push in on the target,
 * land the beat, pull back out. Roughly 11 seconds before the tool's own
 * waits — enough to confirm the pipeline on a route before writing its real
 * exciting-moment script.
 */
export async function defaultArc(
  page: Page,
  {
    target,
    zoomTo,
    beatText,
  }: { target: string; zoomTo: number; beatText: string }
) {
  await page.waitForSelector(target)
  await keyframe(page, "start")
  await hold(page, 1200)
  await zoom(page, target, zoomTo)
  await showBeat(page, beatText)
  await keyframe(page, "beat")
  await hold(page, 2000)
  await hideBeat(page)
  await zoom(page, target, 1)
  await hold(page, 800)
  await keyframe(page, "end")
}
