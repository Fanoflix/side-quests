import type { Page } from "playwright"
import { hideBeat, hold, keyframe, showBeat, zoom } from "./stage"

const PREVIEW = "main [role='button']"

// The roll itself is 0.5s plus a small stagger; the rest of the gap is the
// pause that lets each word register as a word before it leaves.
const ROLL_SETTLE_MS = 1400
const WORDS_TO_ROLL = 4

/**
 * Not a zoom arc: the whole clip is the odometer. Push in gently on the
 * preview so the letters fill the frame, click through a few words from the
 * wheel, and let the beat land on the last roll while it's still settling.
 */
export async function run(page: Page) {
  const preview = page.locator(PREVIEW).first()
  await preview.waitFor()
  await keyframe(page, "start")
  await hold(page, 1000)
  await zoom(page, PREVIEW, 1.8, 1600)

  for (let i = 0; i < WORDS_TO_ROLL; i++) {
    await preview.click()
    if (i === WORDS_TO_ROLL - 1) {
      await hold(page, 250)
      await showBeat(page, "odometer-rolling letters")
      await keyframe(page, "beat")
    }
    await hold(page, ROLL_SETTLE_MS)
  }

  await hold(page, 1200)
  await hideBeat(page)
  await zoom(page, PREVIEW, 1, 1600)
  await hold(page, 500)
  await keyframe(page, "end")
}
