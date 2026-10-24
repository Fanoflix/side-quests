# AGENTS.md

Orientation for an agent picking up work in this repo. Read this before touching
anything; it is the fastest path from cold start to a correct first edit.

## What webfun is

A static site of small, self-contained interactive experiments — graphics
techniques, motion studies, speculative UI concepts. Each experiment is called a
**tool** (or **entry**), lives at its own route, and is written to be *understood*,
not just used: every tool ships an explainer doc alongside its code.

Tone of the site: playful, plain-spoken, no jargon in user-facing copy. The code
comments are the opposite — they explain *why* a decision was made, at length,
because the "why" is the thing a future reader can't recover.

Deployed as a static SPA to GitHub Pages under the `/webfun/` base path.

## Stack

| Thing | Choice |
|---|---|
| Framework | TanStack Start (React 19), SPA mode — prerendered shell, client router |
| Router | TanStack Router, **file-based**; `src/routeTree.gen.ts` is generated — never hand-edit |
| Build | Vite 8, `base` = `/webfun/` in prod (override with `VITE_BASE`) |
| Styling | Tailwind v4 (CSS-first config in `src/styles.css`), shadcn on Base UI |
| Animation | `motion` (Framer Motion v12) |
| Icons | `lucide-react` |
| Package manager | **Yarn 4**, node-modules linker (`nodeLinker` in `.yarnrc.yml`) |
| Tests | Vitest; DOM tests opt in per file with `// @vitest-environment jsdom` |

Commands: `yarn dev` (port 3005), `yarn build`, `yarn test`, `yarn lint`,
`yarn typecheck`, `yarn format`.

Style: no semicolons, double quotes, 2-space indent, 80-column print width, ES5
trailing commas. `@/*` maps to `src/*`. TS is `strict` with `noUnusedLocals` and
`noUnusedParameters` — dead variables fail the typecheck, they aren't warnings.

## Directory map

```
src/
  routes/                  # one file per URL; each is ~5 lines, delegating to a feature
    __root.tsx             # <html> shell, meta/OG tags, favicon, devtools
    index.tsx              # home
    <slug>.tsx             # one per tool
  features/
    <category>/<slug>/     # the tools themselves — see "Anatomy of a tool"
    nav/                   # tools.ts (the tool list), top bar, left ghost list, ⌘K quest finder, prev/next
    home/                  # landing page + the live card previews
    explainers/            # renders each tool's explainer.md under the tool
    seo/                   # page meta + the dev-only /og/<slug> card used by `yarn og`
    theme/                 # dark/light toggle + no-flash init script
    motion/eases.ts        # shared easing curves, incl. NumberFlow's default curve
  components/
    ui/                    # shadcn primitives — generated, don't hand-restyle
    layout/                # AppLayout, ToolIntro/IntroLink
    stage/                 # ToolStage (display area; controls portal into the right rail, or a bottom sheet below xl), Panel, Range
    loupe/                 # reusable zoom-loupe (ZoomBox, ZoomSelection, useRegionDrag)
  lib/utils.ts             # `cn()`
  styles.css               # Tailwind import + the whole oklch theme token set
```

Tool categories that exist today (`features/<category>/`):

- **`canvas-stuff/`** — graphics techniques on a canvas: `dithering`,
  `anti-aliasing`, `low-res-video`
- **`motion/`** — animation studies: `character-flow`, `style-flow`
- **`speculative-ui/`** — invented interaction concepts: `future-table`,
  `concept-chat`

A genuinely new kind of entry may warrant a new category folder — but check with
the user first; the categories double as the group labels in the left list.

## Anatomy of a tool

Two shapes, depending on size. Both obey the same law (below).

**Small/medium** — flat folder (`dithering`, `anti-aliasing`, `style-flow`):

```
features/canvas-stuff/dithering/
  Dither.tsx          # the page; view only
  useDither.ts        # all state, effects, pipeline wiring
  pipeline.ts         # pure logic, no React
  DitherCanvas.tsx    # view
  Controls.tsx        # view
  StatsPanel.tsx      # view
  explainer.md        # the ELI5 explainer shown under the tool (required)
  how-it-works.md     # the full technical write-up, linked from the explainer
  short-demo.md       # the reel script
```

**Large** — three-layer split (`future-table`, `concept-chat`):

```
features/speculative-ui/future-table/
  engine/       # types, pure core logic, and the use* hooks that drive it
  components/   # view-only building blocks
  demo/         # the page component + its own hook + demo fixtures
```

Use the flat shape by default. Reach for `engine/components/demo` only when the
tool is a reusable *mechanism* with a demo wrapped around it — that split exists
so the mechanism can be read without the demo's noise.

## The one non-negotiable rule

**Components are view-only. All logic lives in a `use*` hook.**

`*.tsx` files contain JSX and presentational helpers — nothing else. Every piece
of state, every effect, every ref, every derived value, every event handler goes
in a hook the component consumes. The page component's body should read as
one destructure of its hook, then markup:

```tsx
export function FutureTableDemo() {
  const { table, pageIndex, hasData, load, clear, nextPage } = useFutureTableDemo()
  return ( /* markup only */ )
}
```

Co-locate logic-owned types with the hook, not the component.

Corollaries the user cares about, and will call out:

- **No unnecessary `useEffect`.** Derive during render; use `useMemo` for
  expensive derivations. Effects are for genuine outside-React synchronisation —
  canvas painting, rAF loops, timers, event listeners, media elements — and each
  one should be defensible in a sentence.
- **No overengineering.** No abstraction layer for a single caller, no options
  object for one option, no generic machinery that one tool uses.
- **Plan before building.** Agree the approach with the user first, then write.

## Registering a new tool (five touchpoints, all required)

1. **Feature folder** — `src/features/<category>/<slug>/`, per the anatomy above.
2. **Route** — `src/routes/<slug>.tsx`. Keep it trivial; the route file exists to
   point at a feature, nothing more:
   ```tsx
   import { createFileRoute } from "@tanstack/react-router"
   import { Thing } from "@/features/<category>/<slug>/Thing"

   export const Route = createFileRoute("/<slug>")({ component: Thing })
   ```
   `routeTree.gen.ts` regenerates itself when the dev server runs.
3. **Tool entry** — add it to `tools` in `src/features/nav/tools.ts`: `slug`,
   `to`, `title`, `icon` (lucide), `category`, `hook` (one plain sentence, used
   on the page, the card and the unfurl), `description` (the unfurl body),
   `added`, and `keywords` (hidden search aliases). Its position in the array is
   its quest number and its place in prev/next. Add a card preview to
   `PREVIEWS` in `features/home/Previews.tsx`.
4. **Page meta** — give the route `head: () => ({ meta: toolMeta("<slug>") })`
   from `src/features/seo/meta.ts`, add the path to `PRERENDERED_PATHS` in
   `vite.config.ts`, and run `yarn og` with the dev server up to regenerate
   `public/og/<slug>.png`. Without these the page has no unfurl and deep links
   404.
5. **`explainer.md` and `how-it-works.md`** — in the feature folder.
   Non-optional; see below.

## explainer.md — the on-page version

Rendered under every tool by `features/explainers`. The first line is a `#`
heading and becomes the section's hook, so make it a sentence worth reading on
its own and different from the page's intro. After that: explain it like the
reader is twelve. Short sections, plain words, the tool's real numbers, a "Try
this" pointing at an actual control, and a last-line link to the full
`how-it-works.md` on GitHub.

## how-it-works.md — the format

Every tool has one, and it is a deliverable, not an afterthought: the point of
the site is that a reader comes away understanding the technique. Ground it in
*this tool's actual code and constants*, never a generic textbook version, and
link to the source file the math lives in.

Two parts:

1. **The detail** — open with a terms glossary in `` `X` = "plain explanation" ``
   form, written so a non-expert can follow it. Then the real formulas, written
   using those terms. Close with a one-sentence "why it works."
2. **The reel** — a ~20-second, hook-first Instagram-reel script with on-screen
   beats, built to travel. (Some tools keep this in a separate `short-demo.md`.)

See `features/canvas-stuff/dithering/how-it-works.md` for the reference example.

## Reuse before you build

Check these first — rebuilding one of them is the most common wasted work:

- `ToolIntro` / `IntroLink` (`components/layout/ToolIntro.tsx`) — the title +
  blurb every tool page opens with. `children` is a node so blurbs can link out.
- `ToolStage` + `useToolStage` (`components/stage/`) — the display area every
  visual tool sits in. Its controls are portalled into the right-hand rail that
  `AppLayout` renders for tools with `controls: true` in `tools.ts` (a Settings
  bottom sheet below 1280px). Pass the controls as a fragment of `Panel`s;
  `stage.width` is the measured display width for sizing canvases. `Range` is
  the shared slider row.
- `components/loupe/*` — shared zoom-loupe. The *magnification logic* stays in
  each feature's own hook; only the view pieces are shared.
- `features/motion/eases.ts` — shared easing curves.
- `components/ui/*` — shadcn primitives. Add new ones with the shadcn CLI rather
  than hand-writing them.

## Conventions worth absorbing

- **Comments explain why, not what.** Match the density of the surrounding file —
  it is high, and deliberately so. A non-obvious layout hack, a fails-closed
  default, a rejected alternative: all worth a paragraph.
- **Copy voice.** User-facing strings are conversational and concrete ("Screens
  are made of squares. Nothing in a game is."). No marketing register, no
  exclamation marks.
- **Theme.** Colours come from the oklch token set in `styles.css` via Tailwind
  classes (`bg-background`, `text-muted-foreground`, `border-border`). Never
  hard-code a hex. Dark is the default; the toggle adds `.dark` to `<html>` and
  `themeInitScript` prevents a flash.
- **Public assets** must go through the base path — see the `asset()` helper in
  `__root.tsx`. A bare `/foo.svg` 404s in production.
- **Don't auto-commit.** Finish the work, verify it, report — and leave the tree
  dirty. Commit only when explicitly asked.

## Before you call it done

```
yarn typecheck && yarn lint && yarn test
```

Then check it in the browser at `yarn dev` — these are visual tools, and a
passing typecheck says nothing about whether the thing looks right.
