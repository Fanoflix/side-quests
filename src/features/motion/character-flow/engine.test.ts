import { describe, expect, it } from "vitest"

import { alignChars, graphemes, reelPath } from "./engine"
import type { FlowOp } from "./engine"

const split = (value: string) => Array.from(value)

function apply(prev: string, next: string, ops: FlowOp[]) {
  const out: string[] = []
  for (const op of ops) {
    if (op.type === "keep") {
      expect(prev[op.from]).toBe(next[op.to])
      out[op.to] = prev[op.from]
    } else if (op.type === "swap" || op.type === "add") {
      out[op.to] = next[op.to]
    }
  }
  return out.join("")
}

function kept(prev: string, next: string) {
  return alignChars(split(prev), split(next))
    .flatMap((op) => (op.type === "keep" ? [prev[op.from]] : []))
    .join("")
}

describe("alignChars", () => {
  it.each([
    ["Lichking", "Lichbane"],
    ["delayed", "boarding"],
    ["", "hello"],
    ["hello", ""],
    ["$980", "$1,024"],
    [
      "the quick brown fox jumps over the lazy dog",
      "the lazy dog sleeps under the quick brown fox",
    ],
  ])("rebuilds %j → %j exactly", (prev, next) => {
    expect(apply(prev, next, alignChars(split(prev), split(next)))).toBe(next)
  })

  it("keeps the shared run and any letter that stays in its seat", () => {
    expect(kept("Lichking", "Lichbane")).toBe("Lichn")
  })

  it("never drags a lone letter across the word", () => {
    const ops = alignChars(split("delayed"), split("boarding"))
    for (const op of ops) {
      if (op.type === "keep")
        expect(Math.abs(op.from - op.to)).toBeLessThanOrEqual(1)
    }
  })

  it("rolls changed letters in place instead of replacing them", () => {
    const ops = alignChars(split("cat"), split("cot"))
    expect(ops.filter((op) => op.type === "swap")).toEqual([
      { type: "swap", from: 1, to: 1 },
    ])
    expect(ops.some((op) => op.type === "add" || op.type === "drop")).toBe(
      false
    )
  })

  it("lines numbers up from the right", () => {
    const ops = alignChars(split("$980"), split("$1,980"))
    expect(ops.flatMap((op) => (op.type === "add" ? [op.to] : []))).toEqual([
      1, 2,
    ])
  })

  it("is cheap on long strings", () => {
    const long = "the quick brown fox jumps over the lazy dog ".repeat(4)
    const started = performance.now()
    alignChars(split(long), split(long.split("").reverse().join("")))
    expect(performance.now() - started).toBeLessThan(50)
  })
})

describe("reelPath", () => {
  it("walks the alphabet the short way round", () => {
    expect(reelPath("a", "d", 6, "auto")).toEqual({
      glyphs: ["a", "b", "c", "d"],
      rollsUp: true,
    })
    expect(reelPath("b", "y", 6, "auto").rollsUp).toBe(false)
  })

  it("caps long trips at maxSteps glyphs in between", () => {
    const { glyphs } = reelPath("a", "m", 4, "up")
    expect(glyphs).toHaveLength(6)
    expect(glyphs[0]).toBe("a")
    expect(glyphs.at(-1)).toBe("m")
  })

  it("goes straight across between different kinds of character", () => {
    expect(reelPath("a", "7", 6, "auto").glyphs).toEqual(["a", "7"])
    expect(reelPath("A", "b", 6, "down")).toEqual({
      glyphs: ["A", "b"],
      rollsUp: false,
    })
  })
})

describe("graphemes", () => {
  it("keeps emoji and accented letters whole", () => {
    expect(graphemes("Olá 👋🏽")).toEqual(["O", "l", "á", " ", "👋🏽"])
  })
})
