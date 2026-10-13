import { reelItems } from "./reel-items"

/**
 * The reel page's state. There isn't any beyond the catalogue — the sheet's
 * open/closed is managed by the Dialog primitive itself through its trigger.
 */
export function useReel() {
  return {
    items: reelItems,
  }
}
