/**
 * The one place that decides what "the search shortcut" is.
 *
 * Two things listen for it — the hook that opens and focuses the field, and the
 * badge that flinches to show it registered — and a badge that reacts to a key
 * the sidebar ignores is worse than no badge at all.
 */
export function isSearchShortcut(event: KeyboardEvent): boolean {
  return event.key === "k" && (event.metaKey || event.ctrlKey)
}

/**
 * Runs a shortcut on **release** rather than on press, and returns a teardown.
 *
 * Arming on keydown and firing on keyup, rather than just listening for keyup:
 * a keyup only carries the modifier if you let go of the letter first, so
 * releasing ⌘ before K would silently miss. Arming records that the combination
 * *was* held, and then any release ends it.
 *
 * The keydown still has to be caught to `preventDefault` — browsers claim both
 * of these combinations, and by keyup the default has already happened.
 */
export function bindShortcutRelease(
  matches: (event: KeyboardEvent) => boolean,
  run: () => void
): () => void {
  let armed = false

  const onKeyDown = (event: KeyboardEvent) => {
    if (!matches(event)) return
    event.preventDefault()
    armed = true
  }

  const onKeyUp = () => {
    if (!armed) return
    armed = false
    run()
  }

  window.addEventListener("keydown", onKeyDown)
  window.addEventListener("keyup", onKeyUp)
  return () => {
    window.removeEventListener("keydown", onKeyDown)
    window.removeEventListener("keyup", onKeyUp)
  }
}
