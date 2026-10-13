import type { Page } from "playwright"
import { defaultArc } from "./stage"

// Placeholder. The real beat is the Samples lever going 1 → 8 while the
// staircase smooths; that needs the slider driven, not just a zoom.
export function run(page: Page) {
  return defaultArc(page, {
    target: "main canvas",
    zoomTo: 2.5,
    beatText: "staircase melts smooth",
  })
}
