/**
 * Map a mouse click to a character offset in the clicked text node, so the
 * input/textarea that opens up in its place can place the caret where the
 * reader actually clicked rather than at the start or the end.
 *
 * The two browser APIs for this are both patchy — Firefox exposes
 * `caretPositionFromPoint`, WebKit and Blink expose `caretRangeFromPoint`.
 * This covers both and returns `null` when neither is available or the point
 * doesn't resolve to a text node (e.g. the click landed on padding), which
 * callers interpret as "fall back to the default".
 */
export function caretOffsetAt(clientX: number, clientY: number): number | null {
  type DocWithCaretPos = Document & {
    caretPositionFromPoint?: (
      x: number,
      y: number
    ) => { offsetNode: Node; offset: number } | null
  }
  const doc = document as DocWithCaretPos

  if (typeof doc.caretPositionFromPoint === "function") {
    const position = doc.caretPositionFromPoint(clientX, clientY)
    return position?.offset ?? null
  }
  if (typeof document.caretRangeFromPoint === "function") {
    const range = document.caretRangeFromPoint(clientX, clientY)
    return range?.startOffset ?? null
  }
  return null
}
