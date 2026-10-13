import type { Page } from "playwright"
import { hideBeat, hold, keyframe, showBeat, zoom } from "./stage"

const SHELL = "main > div"
const TICKET_ROW = "main ul li button"
const STATUS_TRIGGER = "[aria-label='Status']"
const STATUS_ITEM = "[data-slot='select-item']"

// RUNG_SWITCH_MS in engine/rungs.ts plus the server's default latency; the
// remount's first fetch has to land before there's a ticket to open.
const RUNG_REBUILD_MS = 1400

/**
 * Climb to the TanStack DB rung first — that's the only rung where the inbox
 * dot and the detail header change in the same tick as the timeline logs the
 * local write. Then open a ticket and flip its status; the beat lands on the
 * flip itself, with the clip held long enough to see the request go out after.
 */
export async function run(page: Page) {
  await page.waitForSelector(TICKET_ROW)
  await keyframe(page, "start")
  await hold(page, 800)

  await page.locator("button[aria-pressed]", { hasText: "TanStack DB" }).click()
  await hold(page, RUNG_REBUILD_MS)
  await page.waitForSelector(TICKET_ROW)
  await hold(page, 600)

  await page.locator(TICKET_ROW).first().click()
  const trigger = page.locator(STATUS_TRIGGER)
  await trigger.waitFor()
  await hold(page, 1000)
  await zoom(page, SHELL, 1.25, 1800)

  // Flip to whichever status the ticket isn't already in, so the dot visibly
  // changes colour whatever the seed data says.
  const current = (await trigger.innerText()).trim()
  const next = current.includes("Done") ? "In progress" : "Done"
  await trigger.click()
  await page.locator(STATUS_ITEM, { hasText: next }).click()
  await showBeat(page, "flip the status, watch nothing happen")
  await keyframe(page, "beat")
  await hold(page, 2600)

  await hideBeat(page)
  await zoom(page, SHELL, 1, 1800)
  await hold(page, 500)
  await keyframe(page, "end")
}
