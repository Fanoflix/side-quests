export type Trend = "up" | "down" | "auto"

export type FlowTiming = {
  duration: number
  easing: string
  slideDuration: number
  slideEasing: string
  fadeDuration: number
  fadeEasing: string
  stagger: number
  delay: number
  trend: Trend
  maxSteps: number
  animate: boolean
}

export type FlowOp =
  | { type: "keep"; from: number; to: number }
  | { type: "swap"; from: number; to: number }
  | { type: "drop"; from: number }
  | { type: "add"; to: number }

export type Reel = { glyphs: string[]; rollsUp: boolean }

const RINGS = [
  "abcdefghijklmnopqrstuvwxyz",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0123456789",
]

const NUMERIC = /^[\d\s$€£¥.,:%+\-−]*\d[\d\s$€£¥.,:%+\-−]*$/

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null

export function graphemes(value: string): string[] {
  return segmenter
    ? Array.from(segmenter.segment(value), (s) => s.segment)
    : Array.from(value)
}

function lcsPairs(a: string[], b: string[]): [number, number][] {
  const n = a.length
  const m = b.length
  const dp = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0)
  )
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const pairs: [number, number][] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) pairs.push([i++, j++])
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++
    else j++
  }
  return pairs
}

function stableAnchors(
  pairs: [number, number][],
  aLength: number,
  bLength: number
): [number, number][] {
  const runs: [number, number][][] = []
  for (const pair of pairs) {
    const run = runs.at(-1)
    const last = run?.at(-1)
    if (run && last && pair[0] === last[0] + 1 && pair[1] === last[1] + 1) {
      run.push(pair)
    } else {
      runs.push([pair])
    }
  }
  const staysPut = ([ai, bi]: [number, number]) =>
    Math.abs(ai - bi) <= 1 || Math.abs(aLength - ai - (bLength - bi)) <= 1
  return runs.filter((run) => run.length > 1 || staysPut(run[0])).flat()
}

function pairGap(
  ops: FlowOp[],
  [i0, i1]: [number, number],
  [j0, j1]: [number, number],
  fromEnd: boolean
) {
  const shared = Math.min(i1 - i0, j1 - j0)
  const swapFrom = fromEnd ? i1 - shared : i0
  const swapTo = fromEnd ? j1 - shared : j0
  for (let i = i0; i < i1; i++) {
    if (i < swapFrom || i >= swapFrom + shared)
      ops.push({ type: "drop", from: i })
  }
  for (let j = j0; j < j1; j++) {
    if (j < swapTo || j >= swapTo + shared) ops.push({ type: "add", to: j })
  }
  for (let k = 0; k < shared; k++) {
    ops.push({ type: "swap", from: swapFrom + k, to: swapTo + k })
  }
}

export function alignChars(a: string[], b: string[]): FlowOp[] {
  const fromEnd = NUMERIC.test(a.join("")) && NUMERIC.test(b.join(""))
  const anchors = stableAnchors(lcsPairs(a, b), a.length, b.length)
  const ops: FlowOp[] = []
  let i = 0
  let j = 0
  for (const [ai, bi] of [...anchors, [a.length, b.length]]) {
    pairGap(ops, [i, ai], [j, bi], fromEnd)
    if (ai < a.length) ops.push({ type: "keep", from: ai, to: bi })
    i = ai + 1
    j = bi + 1
  }
  return ops
}

export function reelPath(
  from: string,
  to: string,
  maxSteps: number,
  trend: Trend
): Reel {
  const ring = RINGS.find((r) => r.includes(from) && r.includes(to))
  if (!ring || from === to) {
    return { glyphs: [from, to], rollsUp: trend !== "down" }
  }
  const len = ring.length
  const a = ring.indexOf(from)
  const forward = (ring.indexOf(to) - a + len) % len
  const backward = len - forward
  const ahead =
    trend === "up" ? true : trend === "down" ? false : forward <= backward
  const distance = ahead ? forward : backward
  const between = Math.min(distance - 1, maxSteps)
  const glyphs = [from]
  for (let k = 1; k <= between; k++) {
    const offset = Math.round((k * distance) / (between + 1))
    glyphs.push(ring[(a + (ahead ? offset : -offset) + len) % len])
  }
  glyphs.push(to)
  return { glyphs, rollsUp: ahead }
}

type Slot = {
  el: HTMLSpanElement
  sizer: HTMLSpanElement
  reel: HTMLSpanElement
  char: string
  slide: Animation | null
}

type Roll = { slot: Slot; from: string | null; to: string }

const PAD = "0.25em"
const LINE_HEIGHT = "1.15"
const BLEED = "0.35em"
const REEL_GAP = `calc(${PAD} + 0.05em)`
const MASK = `linear-gradient(transparent, #000 ${PAD}, #000 calc(100% - ${PAD}), transparent)`

function span(style: Partial<CSSStyleDeclaration>, text?: string) {
  const el = document.createElement("span")
  Object.assign(el.style, style)
  if (text !== undefined) el.textContent = text
  return el
}

function makeSlot(char: string): Slot {
  const el = span({
    display: "inline-block",
    position: "relative",
    padding: `${PAD} ${BLEED}`,
    margin: `-${PAD} -${BLEED}`,
    overflow: "clip",
    maskImage: MASK,
    webkitMaskImage: MASK,
  })
  const sizer = span({ visibility: "hidden", whiteSpace: "pre" }, char)
  const reel = span(
    {
      position: "absolute",
      left: "50%",
      top: PAD,
      translate: "-50% 0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      whiteSpace: "pre",
    },
    char
  )
  el.append(sizer, reel)
  return { el, sizer, reel, char, slide: null }
}

function glyph(char: string) {
  return span(
    { display: "block", whiteSpace: "pre", paddingBottom: REEL_GAP },
    char
  )
}

export class FlowEngine {
  private readonly root: HTMLElement
  private readonly line: HTMLSpanElement
  private readonly label: HTMLSpanElement
  private slots: Slot[] = []
  private readonly exiting = new Set<Slot>()
  private value: string | null = null
  private target: string | null = null
  private pending: ReturnType<typeof setTimeout> | undefined

  constructor(root: HTMLElement) {
    this.root = root
    this.label = span({
      position: "absolute",
      width: "1px",
      height: "1px",
      overflow: "hidden",
      clipPath: "inset(50%)",
      whiteSpace: "nowrap",
    })
    this.line = span({
      display: "inline-flex",
      position: "relative",
      whiteSpace: "pre",
      lineHeight: LINE_HEIGHT,
    })
    this.line.setAttribute("aria-hidden", "true")
    root.append(this.label, this.line)
  }

  destroy() {
    clearTimeout(this.pending)
    this.root.getAnimations({ subtree: true }).forEach((a) => a.cancel())
    this.label.remove()
    this.line.remove()
  }

  update(value: string, timing: FlowTiming) {
    if (value === this.target) return
    this.target = value
    clearTimeout(this.pending)
    if (timing.delay > 0 && timing.animate && this.value !== null) {
      this.pending = setTimeout(() => this.apply(value, timing), timing.delay)
    } else {
      this.apply(value, timing)
    }
  }

  private apply(value: string, timing: FlowTiming) {
    this.pending = undefined
    if (value === this.value) return
    const animate = timing.animate && this.value !== null
    this.value = value
    this.label.textContent = value

    const nextChars = graphemes(value)
    const before = this.slots.map((s) => s.el.getBoundingClientRect().left)
    const lineLeft = this.line.getBoundingClientRect().left
    const next: { slot: Slot; from: number }[] = new Array(nextChars.length)
    const leaving: Slot[] = []
    const rolls: Roll[] = []

    const ops = alignChars(
      this.slots.map((s) => s.char),
      nextChars
    )
    for (const op of ops) {
      if (op.type === "keep") {
        next[op.to] = { slot: this.slots[op.from], from: op.from }
      } else if (op.type === "swap") {
        const slot = this.slots[op.from]
        const to = nextChars[op.to]
        if (slot.char !== to) {
          rolls.push({ slot, from: slot.char, to })
          slot.char = to
          slot.sizer.textContent = to
        }
        next[op.to] = { slot, from: op.from }
      } else if (op.type === "drop") {
        const slot = this.slots[op.from]
        slot.el.style.left = `${before[op.from] - lineLeft}px`
        leaving.push(slot)
      } else {
        const slot = makeSlot(nextChars[op.to])
        next[op.to] = { slot, from: -1 }
        rolls.push({ slot, from: null, to: nextChars[op.to] })
      }
    }

    for (const slot of leaving) {
      slot.el.getAnimations({ subtree: true }).forEach((a) => a.cancel())
      slot.reel.textContent = slot.char
      Object.assign(slot.el.style, {
        position: "absolute",
        top: "0",
        marginLeft: "0",
        marginRight: "0",
        pointerEvents: "none",
      })
    }

    leaving.forEach((s) => this.exiting.add(s))
    this.line.replaceChildren(
      ...next.map((n) => n.slot.el),
      ...Array.from(this.exiting, (s) => s.el)
    )
    this.slots = next.map((n) => n.slot)

    if (!animate) {
      for (const { slot, to } of rolls) {
        slot.reel.getAnimations().forEach((a) => a.cancel())
        slot.reel.textContent = to
      }
      this.exiting.forEach((s) => s.el.remove())
      this.exiting.clear()
      return
    }

    const shift = this.line.getBoundingClientRect().left - lineLeft
    for (const slot of this.exiting) {
      slot.el.style.left = `${parseFloat(slot.el.style.left) - shift}px`
    }

    this.slideKept(next, before, timing)
    rolls.forEach((roll, rank) =>
      this.roll(roll, rank * timing.stagger, timing)
    )
    leaving.forEach((slot) => this.leave(slot, timing))
  }

  private slideKept(
    next: { slot: Slot; from: number }[],
    before: number[],
    timing: FlowTiming
  ) {
    const kept = next.filter((n) => n.from >= 0)
    kept.forEach((n) => n.slot.slide?.cancel())
    const after = kept.map((n) => n.slot.el.getBoundingClientRect().left)
    kept.forEach((n, k) => {
      const dx = before[n.from] - after[k]
      if (Math.abs(dx) < 0.5) return
      n.slot.slide = n.slot.el.animate(
        [{ transform: `translateX(${dx}px)` }, { transform: "none" }],
        { duration: timing.slideDuration, easing: timing.slideEasing }
      )
    })
  }

  private roll({ slot, from, to }: Roll, delay: number, timing: FlowTiming) {
    slot.reel.getAnimations().forEach((a) => a.cancel())
    if (from === null) {
      const rise = timing.trend === "down" ? "-100%" : "100%"
      slot.reel.animate(
        [{ transform: `translateY(${rise})` }, { transform: "none" }],
        {
          duration: timing.duration,
          easing: timing.easing,
          delay,
          fill: "backwards",
        }
      )
      slot.reel.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: timing.duration,
        easing: timing.easing,
        delay,
        fill: "backwards",
      })
      return
    }

    const { glyphs, rollsUp } = reelPath(
      from,
      to,
      timing.maxSteps,
      timing.trend
    )
    const steps = glyphs.length - 1
    const column = rollsUp ? glyphs : [...glyphs].reverse()
    const end = `translateY(${(-100 * steps) / glyphs.length}%)`
    slot.reel.replaceChildren(...column.map(glyph))
    const spin = slot.reel.animate(
      rollsUp
        ? [{ transform: "none" }, { transform: end }]
        : [{ transform: end }, { transform: "none" }],
      { duration: timing.duration, easing: timing.easing, delay, fill: "both" }
    )
    spin.onfinish = () => {
      if (slot.char !== to) return
      slot.reel.textContent = to
      spin.cancel()
    }
  }

  private leave(slot: Slot, timing: FlowTiming) {
    const exit = timing.trend === "down" ? "100%" : "-100%"
    slot.reel.animate(
      [{ transform: "none" }, { transform: `translateY(${exit})` }],
      { duration: timing.duration, easing: timing.easing, fill: "forwards" }
    )
    const out = slot.el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: timing.fadeDuration,
      easing: timing.fadeEasing,
      fill: "forwards",
    })
    out.onfinish = () => {
      slot.el.remove()
      this.exiting.delete(slot)
    }
  }
}
