# Reel recordings

`yarn record-reel <slug>` films one tool; `yarn record-reel all` films every
tool. Add `--format=gif` to also produce a GIF (needs `ffmpeg`, ideally with
`gifski` beside it; without either the WebM is kept and a warning is printed).

Output lands in `public/reel/<slug>.webm` (and `.gif`). Keyframe screenshots
go to `$TMPDIR/webfun-reel/<slug>/` for checking what the page looked like
when a beat fired.

The dev server on port 3005 is reused when it is already running, otherwise
the script starts one and stops it when done. The browser is headful on
purpose: `requestAnimationFrame` and CSS animations throttle in background or
headless tabs, and these clips are all timing. Don't focus another window
while it records.

## Adding a tool

1. Create `scripts/reel-animations/<slug>.ts` exporting
   `run(page: Page): Promise<void>`.
2. Register it in the `TOOLS` map in `scripts/record-reel.ts` with its route.
3. Start with `defaultArc(page, { target, zoomTo, beatText })` from
   `stage.ts`: a hold, a push in on `target`, the beat text with a vignette,
   then a pull back out. Once the placeholder clip records, replace it with the
   tool's own exciting moment using the same primitives — `zoom`, `showBeat`,
   `hideBeat`, `hold`, `keyframe` — plus whatever Playwright clicks the tool
   needs. `character-flow.ts` and `tanstack-showcase.ts` are the worked
   examples.

Scope selectors to `main` so the hidden sidebar and panels can't match. The
stage CSS hides the sidebar, inset header, floating panels and the ToolIntro;
if a new tool has chrome of its own that shouldn't be filmed, hide it in
`run` with `page.addStyleTag` rather than widening the shared CSS.
