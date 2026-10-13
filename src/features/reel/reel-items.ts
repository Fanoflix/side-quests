import type { LucideIcon } from "lucide-react"
import {
  Grip,
  MessagesSquare,
  MonitorPlay,
  Spline,
  Sparkles,
  Layers,
  Table2,
  Type,
} from "lucide-react"

/**
 * The reel: one exciting moment per tool, with the GIF filename that captures
 * it. The GIFs live in `public/reel/`; a missing file falls through to the
 * placeholder in the sheet, so this list can carry the whole catalogue even
 * while GIFs are still being filmed.
 *
 * The order mirrors the sidebar so the sheet reads as a tour of the site
 * rather than a shuffled index.
 */
export type ReelItem = {
  title: string
  to: string
  icon: LucideIcon
  /** The beat the clip is cut around — two to four words, written on the GIF. */
  beat: string
  /** One-sentence tease, the hook under the clip. */
  line: string
  /**
   * Filename inside `public/reel/`, including extension. `.webm` and `.mp4`
   * render as inline-playing video; `.gif` renders as an image. The recorder
   * (`scripts/record-reel.ts`) produces WebM by default; a GIF export only
   * exists when ffmpeg or gifski is installed on the host.
   */
  clip: string
}

export const reelItems: ReelItem[] = [
  {
    title: "Dithering",
    to: "/dithering",
    icon: Grip,
    beat: "dots become a photo",
    line: "Zoom out from a field of black-and-white dots and the pattern resolves into a greyscale photograph your eye has blended on its own.",
    clip: "dithering.mp4",
  },
  {
    title: "Anti-aliasing",
    to: "/anti-aliasing",
    icon: Spline,
    beat: "staircase melts smooth",
    line: "Slide the Samples lever from 1 to 8 and a jagged diagonal staircase melts into a clean straight edge the screen never actually drew.",
    clip: "anti-aliasing.webm",
  },
  {
    title: "Low Res Video",
    to: "/low-res-video",
    icon: MonitorPlay,
    beat: "dot field becomes video",
    line: "Pull back on a few hundred coloured dots on black and the field resolves into a moving picture; then flick the dot shape from circle to diamond.",
    clip: "low-res-video.webm",
  },
  {
    title: "Character Flow",
    to: "/character-flow",
    icon: Type,
    beat: "odometer-rolling letters",
    line: "Letters shared between two words slide across in place while the unmatched ones roll in like an odometer — a digit that changed more travels visibly faster in the same time.",
    clip: "character-flow.mp4",
  },
  {
    title: "Style Flow",
    to: "/style-flow",
    icon: Sparkles,
    beat: "one word, breathing",
    line: "A single word sits still, then starts to breathe: one letter thickens, another leans into italic, another sprouts serifs, before the whole run eases home to a clean wordmark.",
    clip: "style-flow.webm",
  },
  {
    title: "Concept table 1",
    to: "/future-table",
    icon: Table2,
    beat: "split-flap row flip",
    line: "The data changes but no row moves; each slot flips over in place like a split-flap departure board, so your eyes never have to re-find where they were.",
    clip: "concept-table.webm",
  },
  {
    title: "Concept chat",
    to: "/concept-chat",
    icon: MessagesSquare,
    beat: "message performs itself",
    line: "A chat message arrives as a poster with a play button; press play and the lines perform themselves one after another at the pace the sender chose.",
    clip: "concept-chat.webm",
  },
  {
    title: "TanStack, lid off",
    to: "/tanstack-showcase",
    icon: Layers,
    beat: "flip the status, watch nothing happen",
    line: "Change a ticket's status at the TanStack DB rung and the inbox updates in the same tick while the right-hand timeline shows the write landing locally before any request has gone out.",
    clip: "tanstack-showcase.webm",
  },
]
