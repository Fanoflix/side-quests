import { cn } from "@/lib/utils"
import { caretOffsetAt } from "./caretFromClick"
import { useEditableTitle } from "./useEditableTitle"

/**
 * Shared metrics for the h2 and the input so swapping between them doesn't
 * nudge the header's height by a pixel. Font size, weight and leading all come
 * from here; the only difference between the two is the caret.
 */
const TEXT = "text-base leading-snug font-semibold"

/**
 * The title cap — a percentage of its container rather than a pixel value, so
 * it tracks the pane as it resizes and always leaves roughly a fifth of the
 * row for the status dropdown and delete button to breathe into.
 */
const TITLE_WIDTH = "max-w-[80%]"

/**
 * Chrome-free field: no border, no ring, no background. The caret is the only
 * tell that this cell is editable, which is exactly what the brief asked for —
 * typing where the title used to be, with nothing moving around it.
 */
const CHROME = "border-0 bg-transparent px-0 outline-none focus:outline-none"

/**
 * The inline-editable title. Click (or Enter) on the heading turns it into an
 * input in the same place with the same font; Enter commits, Escape reverts,
 * blur commits. The underlying hook owns the state so this file is only
 * responsible for rendering it.
 */
export function TitleField({
  value,
  onRename,
  isMutating,
}: {
  value: string
  onRename: (next: string) => void
  isMutating: boolean
}) {
  const { isEditing, draft, setDraft, start, commit, onKeyDown, bindInput } =
    useEditableTitle({ value, onCommit: onRename })

  if (isEditing) {
    return (
      <input
        ref={bindInput}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        aria-label="Rename ticket"
        // `type="text"` is default, but spelling it out guards against a
        // parent form coercing this into a submit on Enter.
        type="text"
        className={cn(
          TEXT,
          TITLE_WIDTH,
          CHROME,
          "block w-full min-w-0 whitespace-nowrap text-foreground"
        )}
      />
    )
  }

  return (
    <h2
      // `role="button"` + `tabIndex` so the heading itself is the affordance:
      // keyboard reachable, click-to-edit, no separate pencil icon. Space is
      // the second common key, matching how a shadcn button activates.
      role="button"
      tabIndex={isMutating ? -1 : 0}
      aria-label="Rename ticket"
      aria-disabled={isMutating || undefined}
      onClick={
        isMutating
          ? undefined
          : (event) => {
              // Convert the click's screen coordinates into a character
              // offset inside the title — read before the swap, because
              // the h2 is about to leave the DOM.
              const offset = caretOffsetAt(event.clientX, event.clientY)
              start(offset ?? undefined)
            }
      }
      onKeyDown={(event) => {
        if (isMutating) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          start()
        }
      }}
      className={cn(
        TEXT,
        TITLE_WIDTH,
        CHROME,
        "block w-full min-w-0 cursor-text truncate",
        isMutating && "cursor-not-allowed opacity-60"
      )}
    >
      {value}
    </h2>
  )
}
