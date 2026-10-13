import type { Page } from "playwright"
import { defaultArc, hold } from "./stage"

// Placeholder. The real beat is "Update statuses" flipping cells in place like
// a split-flap board; this only loads the data and pushes in on the table.
export async function run(page: Page) {
  await page.getByRole("button", { name: "Load data" }).click()
  await hold(page, 800)
  await defaultArc(page, {
    target: "main table",
    zoomTo: 1.5,
    beatText: "split-flap row flip",
  })
}
