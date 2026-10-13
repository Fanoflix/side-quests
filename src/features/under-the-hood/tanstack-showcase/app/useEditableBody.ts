import type React from "react"
import { useCallback, useRef, useState } from "react"

/**
 * Body paragraphs are stored as an array server-side; the textarea works in a
 * single string with blank lines between paragraphs. These two helpers are the
 * contract between those two shapes, kept together so a round-trip from
 * paragraphs to draft and back is reversible.
 */
export const toDraft = (paragraphs: string[]) => paragraphs.join("\n\n")

const fromDraft = (draft: string) =>
  draft
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)

/**
 * The state behind an inline-editable multi-line body.
 *
 * Same shape as `useEditableTitle`: `start(offset)` swaps the paragraphs out
 * for a textarea seeded with the current body, with the caret placed where
 * the reader clicked (or at the end on a keyboard open). `commit` writes a
 * trimmed non-empty, actually-changed draft back as paragraphs; `cancel`
 * throws the draft away.
 *
 * Autoresize lives on the ref callback and on `onChange`, so a textarea
 * grows to its content between React's commit and the browser's paint
 * rather than one frame later.
 */
export function useEditableBody({
  value,
  onCommit,
}: {
  value: string[]
  onCommit: (next: string[]) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(() => toDraft(value))
  const caretOffset = useRef<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const resize = useCallback(() => {
    const element = textareaRef.current
    if (!element) return
    element.style.height = "auto"
    element.style.height = `${element.scrollHeight}px`
  }, [])

  const start = useCallback(
    (offset?: number) => {
      caretOffset.current = offset ?? null
      setDraft(toDraft(value))
      setIsEditing(true)
    },
    [value]
  )

  const cancel = useCallback(() => {
    setIsEditing(false)
  }, [])

  const commit = useCallback(() => {
    const next = fromDraft(draft)
    setIsEditing(false)
    // Empty or unchanged is a silent revert: nothing to tell the server about,
    // and the paragraphs on screen are already right.
    if (next.length === 0) return
    const same =
      next.length === value.length && next.every((line, i) => line === value[i])
    if (same) return
    onCommit(next)
  }, [draft, onCommit, value])

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Escape") {
        event.preventDefault()
        cancel()
        return
      }
      // Enter inserts a newline (textarea's default). Cmd/Ctrl+Enter commits
      // — the convention in every multi-line input that writes.
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        commit()
      }
    },
    [cancel, commit]
  )

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDraft(event.target.value)
      resize()
    },
    [resize]
  )

  const bindTextarea = useCallback(
    (element: HTMLTextAreaElement | null) => {
      textareaRef.current = element
      if (!element) return
      element.focus()
      const offset = caretOffset.current ?? element.value.length
      const clamped = Math.max(0, Math.min(element.value.length, offset))
      element.setSelectionRange(clamped, clamped)
      resize()
    },
    [resize]
  )

  return {
    isEditing,
    draft,
    start,
    cancel,
    commit,
    onChange,
    onKeyDown,
    bindTextarea,
  }
}
