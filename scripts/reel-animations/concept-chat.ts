import type { Page } from "playwright"
import { defaultArc } from "./stage"

// Placeholder. The real beat presses play on a poster message and lets the
// lines perform themselves at the sender's pace.
export function run(page: Page) {
  return defaultArc(page, {
    target: "main > div",
    zoomTo: 1.4,
    beatText: "message performs itself",
  })
}
