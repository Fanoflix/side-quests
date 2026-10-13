import type { Page } from "playwright"
import { hideBeat, hold, keyframe, showBeat, zoom } from "./stage"

const CANVAS = "main canvas"

/**
 * Inverted arc: open already pushed in so the frame is nothing but dots, then
 * pull out and let the photograph assemble itself. The reveal is the beat, so
 * the text lands as the zoom finishes rather than before it.
 */
export async function run(page: Page) {
  await page.waitForSelector(CANVAS)
  // The default image is fetched and dithered after mount; a 1x1 canvas means
  // the pipeline hasn't painted yet.
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("main canvas")
    return canvas !== null && canvas.width > 1
  })

  await zoom(page, CANVAS, 4, 0)
  await keyframe(page, "start")
  await hold(page, 1800)
  await zoom(page, CANVAS, 1, 3200)
  await showBeat(page, "dots become a photo")
  await keyframe(page, "beat")
  await hold(page, 2400)
  await hideBeat(page)
  await hold(page, 600)
  await keyframe(page, "end")
}
