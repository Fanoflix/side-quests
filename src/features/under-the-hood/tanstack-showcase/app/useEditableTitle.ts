import { useCallback, useRef, useState } from "react"

/**
 * The state behind an inline-editable text field.
 *
 * `start(offset)` swaps the view out for an input and seeds the draft from the
 * current value, with the caret placed at `offset` characters into the text —
 * the position the user actually clicked, rather than the default select-all.
 * `commit` writes a trimmed non-empty, actually-changed draft through
 * `onCommit`; `cancel` throws the draft away. Enter and Escape read the way
 * they do in Finder's rename: Enter commits, Escape cancels, blur commits.
 *
 * Nothing here uses `useEffect`. Focus-and-caret is tied to the input's own
 * mount via a ref callback, which only runs once the element is in the DOM —
 * trying to focus before that is a no-op, and an effect would race the first
 * paint of the input.
 */
export function useEditableTitle({
  value,
  onCommit,
}: {
  value: string
  onCommit: (next: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const caretOffset = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const start = useCallback(
    (offset?: number) => {
      caretOffset.current = offset ?? null
      setDraft(value)
      setIsEditing(true)
    },
    [value]
  )

  const cancel = useCallback(() => {
    setIsEditing(false)
  }, [])

  const commit = useCallback(() => {
    const next = draft.trim()
    setIsEditing(false)
    // Empty or unchanged is a silent revert: it never has to tell the server
    // and never has to open a sync segment for a non-change.
    if (next.length === 0 || next === value) return
    onCommit(next)
  }, [draft, onCommit, value])

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault()
        commit()
      } else if (event.key === "Escape") {
        event.preventDefault()
        cancel()
      }
    },
    [cancel, commit]
  )

  // Attached via `ref={bindInput}` so focus-and-caret happens exactly when the
  // input lands in the DOM. The caret goes to the offset `start` was given —
  // for a mouse click that's the character the user actually clicked, for a
  // keyboard open it's the end.
  const bindInput = useCallback((element: HTMLInputElement | null) => {
    inputRef.current = element
    if (!element) return
    element.focus()
    const offset = caretOffset.current ?? element.value.length
    const clamped = Math.max(0, Math.min(element.value.length, offset))
    element.setSelectionRange(clamped, clamped)
  }, [])

  return {
    isEditing,
    draft,
    setDraft,
    start,
    cancel,
    commit,
    onKeyDown,
    bindInput,
  }
}
