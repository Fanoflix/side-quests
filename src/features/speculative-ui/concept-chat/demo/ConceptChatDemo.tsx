import { ToolIntro } from "@/components/layout/ToolIntro"
import { ChatFrame } from "../components/ChatFrame"

/**
 * Concept chat's page. Unlike every other tool here — a centred card — this one
 * takes the full area, because a chat app that doesn't fill its window reads as a
 * screenshot of one.
 */
export function ConceptChatDemo() {
  return (
    // The app shell is `min-h-svh` — it grows with its content and never bounds
    // its children, which is right for a page of controls and wrong for a chat
    // app: the frame would stretch and the *window* would scroll instead of the
    // thread. So this page pins its own height, and every flex level below it
    // carries `min-h-0` so the overflow lands on the message list.
    //
    // The top bar (h-14), the column's top padding (pt-8, pt-10 from sm) and a
    // 24px gap at the bottom. The one place this feature is coupled to
    // AppLayout's chrome.
    <div className="flex h-[calc(100svh-7rem)] min-h-96 w-full min-w-0 flex-col gap-6 self-stretch overflow-hidden sm:h-[calc(100svh-7.5rem)]">
      <ToolIntro
        title="Concept chat"
        hint="Press play on the message to see it typed out the way it was sent. Then write your own."
      >
        What if a text message kept the timing of how you typed it?
      </ToolIntro>

      <ChatFrame />
    </div>
  )
}
