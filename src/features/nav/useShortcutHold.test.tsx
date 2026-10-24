// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { isSearchShortcut } from "./shortcut"
import { useShortcutHold } from "./useShortcutHold"

function Probe() {
  const ref = useShortcutHold<HTMLSpanElement>(isSearchShortcut)
  return <span ref={ref} data-testid="probe" />
}

const probe = () => screen.getByTestId("probe")
const held = () => probe().hasAttribute("data-pressed")

afterEach(cleanup)

describe("useShortcutHold", () => {
  it("holds for as long as the combination is down", () => {
    render(<Probe />)

    expect(held()).toBe(false)

    fireEvent.keyDown(window, { key: "k", metaKey: true })
    expect(held()).toBe(true)

    fireEvent.keyUp(window, { key: "k", metaKey: true })
    expect(held()).toBe(false)
  })

  it("stays held while the key repeats", () => {
    render(<Probe />)

    fireEvent.keyDown(window, { key: "k", metaKey: true })
    fireEvent.keyDown(window, { key: "k", metaKey: true, repeat: true })

    expect(held()).toBe(true)
  })

  it("releases even when the modifier is let go first", () => {
    // The keyup for `k` then carries no `metaKey`, so matching on keyup alone
    // would leave this stuck down.
    render(<Probe />)

    fireEvent.keyDown(window, { key: "k", metaKey: true })
    fireEvent.keyUp(window, { key: "Meta" })

    expect(held()).toBe(false)
  })

  it("releases when the window loses focus mid-hold", () => {
    render(<Probe />)

    fireEvent.keyDown(window, { key: "k", metaKey: true })
    fireEvent.blur(window)

    expect(held()).toBe(false)
  })

  it("ignores the letter without its modifier", () => {
    render(<Probe />)

    fireEvent.keyDown(window, { key: "k" })

    expect(held()).toBe(false)
  })
})
