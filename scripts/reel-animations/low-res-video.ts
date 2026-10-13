import type { Page } from "playwright"
import { defaultArc } from "./stage"

// Placeholder. The real beat pulls back from a dot field until it reads as
// video, then flicks the dot shape from circle to diamond.
export function run(page: Page) {
  return defaultArc(page, {
    target: "main canvas",
    zoomTo: 2,
    beatText: "dot field becomes video",
  })
}
