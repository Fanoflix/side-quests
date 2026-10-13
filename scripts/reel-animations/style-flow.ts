import type { Page } from "playwright"
import { defaultArc } from "./stage"

// Placeholder. The real beat is one word breathing through weight, slant and
// serif changes before easing home.
export function run(page: Page) {
  return defaultArc(page, {
    target: "main [role='button']",
    zoomTo: 1.6,
    beatText: "one word, breathing",
  })
}
