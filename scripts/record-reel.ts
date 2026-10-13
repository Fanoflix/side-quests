import { spawn, spawnSync } from "node:child_process"
import { copyFile, mkdir, mkdtemp, readdir, rm, stat } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import process from "node:process"
import { chromium } from "playwright"
import type { Page } from "playwright"

import {
  prepareStage,
  setKeyframeDir,
  stageInitScript,
} from "./reel-animations/stage"
import * as dithering from "./reel-animations/dithering"
import * as antiAliasing from "./reel-animations/anti-aliasing"
import * as lowResVideo from "./reel-animations/low-res-video"
import * as characterFlow from "./reel-animations/character-flow"
import * as styleFlow from "./reel-animations/style-flow"
import * as futureTable from "./reel-animations/future-table"
import * as conceptChat from "./reel-animations/concept-chat"
import * as tanstackShowcase from "./reel-animations/tanstack-showcase"

const PORT = 3005
const ORIGIN = `http://localhost:${PORT}`
const OUT_DIR = path.resolve("public/reel")
const KEYFRAME_ROOT = path.join(os.tmpdir(), "webfun-reel")

// 16:9 at a size that keeps a 20-second clip in the low megabytes.
const VIEWPORT = { width: 1280, height: 720 }

type Tool = { route: string; run: (page: Page) => Promise<void> }

const TOOLS: Record<string, Tool> = {
  dithering: { route: "/dithering", run: dithering.run },
  "anti-aliasing": { route: "/anti-aliasing", run: antiAliasing.run },
  "low-res-video": { route: "/low-res-video", run: lowResVideo.run },
  "character-flow": { route: "/character-flow", run: characterFlow.run },
  "style-flow": { route: "/style-flow", run: styleFlow.run },
  "future-table": { route: "/future-table", run: futureTable.run },
  "concept-chat": { route: "/concept-chat", run: conceptChat.run },
  "tanstack-showcase": {
    route: "/tanstack-showcase",
    run: tanstackShowcase.run,
  },
}

function parseArgs(argv: string[]) {
  const flags = argv.filter((arg) => arg.startsWith("--"))
  const [target] = argv.filter((arg) => !arg.startsWith("--"))
  const format = flags
    .find((flag) => flag.startsWith("--format="))
    ?.slice("--format=".length)

  if (!target || (target !== "all" && !(target in TOOLS))) {
    console.error(
      `usage: yarn record-reel <slug|all> [--format=gif|webm]\n` +
        `slugs: ${Object.keys(TOOLS).join(", ")}`
    )
    process.exit(1)
  }
  if (format !== undefined && format !== "gif" && format !== "webm") {
    console.error(`unknown --format: ${format}`)
    process.exit(1)
  }

  const slugs = target === "all" ? Object.keys(TOOLS) : [target]
  return { slugs, gif: format === "gif" }
}

async function isServerUp() {
  try {
    const response = await fetch(ORIGIN, { method: "HEAD" })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Reuses a running `yarn dev` when there is one — the usual case while
 * iterating on a script — and otherwise owns one for the duration. The child
 * is its own process group so the kill reaches Vite and not just the yarn
 * wrapper around it.
 */
async function ensureDevServer(): Promise<() => void> {
  if (await isServerUp()) {
    console.log(`reusing dev server at ${ORIGIN}`)
    return () => {}
  }

  console.log("starting dev server…")
  const child = spawn("yarn", ["dev"], { stdio: "ignore", detached: true })
  const stop = () => {
    if (child.pid) process.kill(-child.pid, "SIGTERM")
  }

  const deadline = Date.now() + 60_000
  while (Date.now() < deadline) {
    if (await isServerUp()) return stop
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  stop()
  throw new Error(`dev server did not come up on ${ORIGIN} within 60s`)
}

async function recordTool(slug: string, { route, run }: Tool) {
  const videoDir = await mkdtemp(path.join(os.tmpdir(), `reel-${slug}-`))
  setKeyframeDir(path.join(KEYFRAME_ROOT, slug))

  // Headful on purpose: rAF and CSS animations throttle in background or
  // headless tabs, and the clips are timing.
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    viewport: VIEWPORT,
    colorScheme: "dark",
    recordVideo: { dir: videoDir, size: VIEWPORT },
  })
  const page = await context.newPage()

  try {
    await page.setContent("<body style='background:#000'></body>")
    await page.addInitScript(stageInitScript())
    await page.goto(`${ORIGIN}${route}`, { waitUntil: "networkidle" })
    await prepareStage(page)
    await run(page)
  } finally {
    await context.close()
    await browser.close()
  }

  const recording = await page.video()?.path()
  if (!recording) throw new Error(`no video was recorded for ${slug}`)

  await mkdir(OUT_DIR, { recursive: true })
  const webm = path.join(OUT_DIR, `${slug}.webm`)
  await copyFile(recording, webm)
  await rm(videoDir, { recursive: true, force: true })
  return webm
}

function binaryPath(name: string) {
  const result = spawnSync("which", [name], { encoding: "utf8" })
  return result.status === 0 ? result.stdout.trim() : null
}

function runBinary(bin: string, args: string[]) {
  const result = spawnSync(bin, args, { stdio: "inherit" })
  return result.status === 0
}

/**
 * gifski makes the smaller, cleaner GIF but wants frames rather than a video,
 * so it needs ffmpeg beside it; ffmpeg alone falls back to its own palette
 * pass. gifski alone only works for builds compiled with video support, which
 * the common Homebrew one is not — hence the final check.
 */
async function convertToGif(webm: string) {
  const gif = webm.replace(/\.webm$/, ".gif")
  const ffmpeg = binaryPath("ffmpeg")
  const gifski = binaryPath("gifski")

  if (ffmpeg && gifski) {
    const framesDir = await mkdtemp(path.join(os.tmpdir(), "reel-frames-"))
    try {
      const extracted = runBinary(ffmpeg, [
        "-y",
        "-i",
        webm,
        "-vf",
        "fps=24,scale=720:-1:flags=lanczos",
        path.join(framesDir, "%05d.png"),
      ])
      const frames = (await readdir(framesDir))
        .sort()
        .map((name) => path.join(framesDir, name))
      if (extracted && runBinary(gifski, ["--fps", "24", "-o", gif, ...frames]))
        return gif
    } finally {
      await rm(framesDir, { recursive: true, force: true })
    }
  } else if (ffmpeg) {
    const filter =
      "fps=24,scale=720:-1:flags=lanczos,split[a][b];" +
      "[a]palettegen[p];[b][p]paletteuse"
    if (runBinary(ffmpeg, ["-y", "-i", webm, "-vf", filter, gif])) return gif
  } else if (gifski) {
    const ok = runBinary(gifski, [
      "--fps",
      "24",
      "--width",
      "720",
      "-o",
      gif,
      webm,
    ])
    if (ok) return gif
  }

  console.warn(
    "could not make a GIF (install ffmpeg, ideally with gifski); keeping WebM"
  )
  return null
}

async function reportSize(file: string) {
  const { size } = await stat(file)
  console.log(
    `  ${path.relative(process.cwd(), file)}  ${(size / 1024).toFixed(0)} KB`
  )
}

async function main() {
  const { slugs, gif } = parseArgs(process.argv.slice(2))
  const stopServer = await ensureDevServer()
  process.on("SIGINT", () => {
    stopServer()
    process.exit(130)
  })

  try {
    for (const slug of slugs) {
      console.log(`recording ${slug}…`)
      const webm = await recordTool(slug, TOOLS[slug])
      await reportSize(webm)
      if (gif) {
        const made = await convertToGif(webm)
        if (made) await reportSize(made)
      }
      console.log(`  keyframes in ${path.join(KEYFRAME_ROOT, slug)}`)
    }
  } finally {
    stopServer()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
