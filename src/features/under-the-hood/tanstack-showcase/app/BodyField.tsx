import { cn } from "@/lib/utils"
import { caretOffsetAt } from "./caretFromClick"
import { toDraft, useEditableBody } from "./useEditableBody"

/**
 * One source of truth for the paragraphs' metrics: display and textarea share
 * these classes exactly, so the swap doesn't nudge line-height or leading.
 * `whitespace-pre-wrap` is what lets a plain string reproduce the paragraph
 * layout — a blank line in the text becomes a blank line on screen, the same
 * way a textarea renders it.
 */
const TEXT =
  "text-sm leading-relaxed text-pretty whitespace-pre-wrap break-words"

/**
 * Chrome-free textarea: no background, no border, no ring, no padding beyond
 * what the paragraphs already have. The caret is the only tell that this is a
 * field — the brief for the whole feature.
 */
const CHROME =
  "resize-none border-0 bg-transparent p-0 outline-none focus:outline-none"

/**
 * Inline-editable body. Click anywhere on the paragraphs to turn them into a
 * textarea seeded with the exact same text — the layout is identical because
 * both are a single element with `whitespace-pre-wrap`, so there is no
 * line-height shift between read and edit. Blur commits, Esc cancels,
 * Cmd/Ctrl+Enter also commits.
 */
export function BodyField({
  value,
  onEdit,
  isMutating,
}: {
  value: string[]
  onEdit: (next: string[]) => void
  isMutating: boolean
}) {
  const { isEditing, draft, start, commit, onChange, onKeyDown, bindTextarea } =
    useEditableBody({ value, onCommit: onEdit })

  if (isEditing) {
    return (
      <textarea
        ref={bindTextarea}
        value={draft}
        onChange={onChange}
        onBlur={commit}
        onKeyDown={onKeyDown}
        aria-label="Edit description"
        className={cn(TEXT, CHROME, "block w-full min-w-0 text-foreground")}
      />
    )
  }

  return (
    <div
      // The whole body is one target: a click anywhere in the paragraphs
      // enters edit mode, which is why this div, not each paragraph, is the
      // affordance. `cursor-text` means the mouse already looks like it's
      // over editable text before the swap happens.
      role="button"
      tabIndex={isMutating ? -1 : 0}
      aria-label="Edit description"
      aria-disabled={isMutating || undefined}
      onClick={
        isMutating
          ? undefined
          : (event) => {
              // The display is one text node with `whitespace-pre-wrap`, so
              // the caret-position API returns the character offset we need
              // directly — no mapping between paragraphs and a joined string.
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
        "block min-w-0 outline-none",
        !isMutating && "cursor-text",
        isMutating && "opacity-60"
      )}
    >
      {toDraft(value)}
    </div>
  )
}
