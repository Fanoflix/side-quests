# How Depth Dust works

Depth Dust draws a picture as **524,288 points**, each one pushed towards you by
how close a depth model thinks that part of the picture is. Then it keeps every
point gently moving, so the depth stays visible.

Everything here happens in [`field.ts`](./field.ts): a few WebGL2 draw calls,
no vertex buffers, and a vertex shader that works out everything about a point
from nothing but its index. The depth estimate lives in [`model.ts`](./model.ts)
and runs in a worker ([`depth.worker.ts`](./depth.worker.ts)); dragging to pan
is [`usePan.ts`](./usePan.ts).

Inspired by [Gather](https://gather.be-of-dao.com) by DAO.

---

## The detail

### Terms (read these first)

- `i` = "the point's index, 0 to 524,287. The GPU hands every point its own `i`."
- `cols`, `rows` = "the grid the points sit on. Its shape matches the picture, so the cells are square."
- `uv` = "where on the picture a point samples, from (0, 0) at the top left to (1, 1) at the bottom right."
- `r₀ … r₆` = "seven random numbers between 0 and 1, the same for a given point every frame."
- `near` = "the depth map at `uv`: 1 for the closest thing in the picture, 0 for the farthest."
- `far` = "`1 − near`."
- `aspect` = "the picture's width divided by its height. The picture is always 1 unit tall."
- `t` = "time in seconds."
- `T` = "the drift clock: seconds × the Drift speed slider, added up frame by frame."
- `drift` = "the Drift slider, 0 to 2." `splash`, `cohesion`, `depth` = "the other sliders, 0 to 1."
- `n` = "the drift line's normal: the way the tick points, the way the plume blows."
- `s` = "how far a point sits past the drift line, along `n`, give or take its own random share of the Softness band."
- `reach`, `spread`, `softness` = "the Reach (0.25–8×), Spread and Softness (0–1) sliders."

### Step 1: the depth map

[Depth Anything V2](https://huggingface.co/onnx-community/depth-anything-v2-small),
small, runs in the browser through `@huggingface/transformers`, inside a Web
Worker so the dust keeps moving while it thinks. It outputs one number per
pixel, which we stretch to 0–255 and upload as a one-channel texture.

Where it runs matters more than anything else. On the GPU (WebGPU, half
precision, about 50 MB) an estimate took 0.4 s. On the CPU (WebAssembly,
8-bit, about 27 MB) the same estimate took 11 s on the page and 35 s in the
worker. So it uses the GPU when the browser has one, and falls back to the CPU
when it doesn't.

The default picture's depth map was worked out ahead of time with `yarn depth`
and shipped as a PNG, so the page never downloads the model unless you drop in
your own picture.

### Step 2: where each point sits

No positions are stored anywhere. The shader rebuilds them from `i`:

```
cols = round(√(524288 · aspect))
rows = floor(524288 / cols)

cell = (i mod cols, floor(i / cols))
uv   = (cell + (r₀, r₁)) / (cols, rows)
```

The `(r₀, r₁)` jitter moves each point to a random spot inside its own cell.
Without it, the points sit on a perfect grid and the picture looks like a screen
door. With it, the picture looks like grain.

The random numbers come from a PCG integer hash of `i`. The usual
`fract(sin(i) · 43758.5)` trick breaks down at indices this large, because
`sin(500000.0)` has already lost most of its float precision.

Then the point is placed in 3D:

```
home = ((uv.x − 0.5) · aspect,  0.5 − uv.y,  (near − 0.5) · depth · 0.9)
```

### Step 3: the picture holds still

The picture keeps its shape. The only motion on it is a small shimmer near the
drift line:

```
feather  = 0.05 + 0.6 · softness
s        = (distance past the line) + (r₃ − 0.5) · feather
nearLine = smoothstep(−0.12 − feather / 2, 0.05, s)
shimmer  = sin(t + 2π · r) per axis · drift · (0.0006 + (0.03 · far³ + 0.01 · edge) · nearLine)
```

Each point sees the line shifted by its own random amount, so the drift starts
across a band instead of along a seam. With every point agreeing on one exact
line, the start of the drift looked like it was drawn with a ruler.

Earlier versions moved a lot more. A standing wave rippled the sheet like a
flag, and a flow field swam regions of it. Both read as the picture wobbling
rather than as depth, so they're gone. Letting the background shimmer
everywhere smudged dark skies nowhere near the line, so that's gone too.

### Step 4: the plume

Past the drift line, the picture gives off dust. The picture itself never moves:
the field is drawn a second time, and in that pass only the points chosen for
the plume are drawn, as copies that travel away. (Moving the picture's own
points left black holes where they used to be.)

```
side    = clamp(s / 0.4, 0, 1)
carried = r₆ < side · drift · 0.95          (0.8 for Dots and Comets)
phase   = fract(T · (0.06 + 0.08 · r₁) + r₄)
reach   = 0.05 + 0.3 · side                 (0.25 + 0.9 · side for Dots and Comets)
bend    = phase² · (r₅ − 0.5) · 0.5  +  a faint wobble
pos    += (heading · phase + across · bend) · reach
```

`heading` is `n` plus a little random spread, so the plume fans into a cone.
`bend` makes each path lean slightly to one side, more the further it goes, so
the dust leaves nearly parallel and frays apart further out. Both the spread
and the bend are multiplied by `2 · spread`, so Spread 0 sends every point out
dead straight, and `reach` is multiplied by the Reach slider. Each point fades
in as it sets off and out as it goes, then starts again from home, so the plume
never runs out.

`T` is a clock the page adds to every frame at the Drift speed slider's rate.
Multiplying `t` by the speed instead made every point jump to a new spot in its
loop whenever you moved the slider.

The particle styles change how the plume is drawn:

- **Subtle**: many points, short trips, smaller and fainter than the picture. A
  fine mist, like Gather's.
- **Dots**: fewer points that travel further. Specks, not mist.
- **Streaks**: Subtle's mist, travelling further (`reach = 0.1 + 0.6 · side`),
  plus a third pass that draws tails as 1 px lines for 60% of the points. Each
  tail runs from where its point was a moment ago (the same path at
  `phase − 0.25 · (0.4 + side)`) to where it is now, fading to nothing. The first version drew tails inside point sprites as big as the
  tail. A sprite is a square, so a 100 px tail cost 10,000 pixels to draw, and
  panning stuttered. A line costs only its length.
- **Comets**: shorter tails on half the points, each with a bigger, brighter
  head.

### Step 5: cohesion and splash

**Cohesion** is how tightly points stay in place. Below 1, each point gets a fixed
random push, mostly in the background:

```
loose = (1 − cohesion)²
pos  += ((r₂, r₃, r₄) − 0.5) · loose · (0.1 + 0.8 · far)
```

It's squared so the top of the slider gives fine control and the bottom falls
apart quickly.

**Splash** picks the points where `r₅ < splash · 0.05`, so up to 5% of them.
Those points leave the picture and slowly orbit at a distance of 0.08 to 0.63
units.

### Step 6: the gather-in

When a picture loads, every point starts at a random spot in a box around it and
flies home over 2.6 seconds. Each point has its own delay, so they arrive as a
swarm and not all at once:

```
k     = clamp((intro − 0.45 · r₃) / 0.55, 0, 1)
e     = 1 − (1 − k)³                              (ease out)
pos   = mix(start, pos, e), then turned by (1 − e) · (1.5 + 2r₄) radians
```

The turn shrinks to zero as each point lands, so the cloud spirals into place.

### Step 7: camera, panning and brightness

The camera is a 30° perspective lens, set back just far enough that the picture
fills 72% of the view. It pans slowly on its own, which is what shows the depth
while you're not touching it, and dragging adds to that:

```
yaw   = 0.22 · sin(0.21t) + 0.08 · sin(0.13t) + panYaw
pitch = 0.07 · sin(0.17t) + panPitch

panYaw   += Δx · 0.005 · panSpeed       (up to ±0.9 rad)
panPitch −= Δy · 0.005 · panSpeed       (up to ±0.45 rad)
```

Each frame the view closes 14% of the gap to where you dragged it, which gives
the cloud a little weight in the hand. Dragging up tips the top of the picture
away from you, as if your finger were on its surface.

Points are blended additively, so where they pile up the picture gets brighter,
like exposure. To keep the brightness the same at any canvas size, each point's
strength is scaled by how many points land on an average pixel:

```
pointPx = 1.6 × devicePixelRatio
overlap = points · (pointPx² · 0.5) / picturePixels
gain    = clamp(1.1 / overlap, 0.04, 1)
colour  = rgb^1.35 · 2.5
```

The points are big enough that neighbours overlap. At 1.1 px the gaps showed and
the picture read as separate specks; overlapping, with `gain` scaling each one
down to match, it reads as fine film grain. The power curve brightens the
highlights without lifting a dark sky into a flat blue wash.

In the light theme, points are opaque flecks of the picture's true colour laid
over the page, with no exposure curve. The loose specks (plume and splash) are
drawn at 45% strength, because full-strength dark specks on white look like
dirt. An inverted "ink" version came first, back when points left gaps and the
plume tore holes in the picture; with both fixed, true colour works.

### Why it works in one sentence

Your eye only needs two things to see a picture as 3D: parts that move against
each other by how far away they are, and enough points that the gaps read as
grain. A depth model gives you the first, and one draw call can give you half a
million points for the second.

---

## The reel

**0–2s.** A still close-up of the Lich King's helm. Text: *"This is a flat picture."*

**2–5s.** It bursts into half a million specks that swirl and settle back into
the photo, which now sways in 3D. Text: *"It isn't anymore."*

**5–9s.** Cut to the grey depth map. Text: *"An AI guessed how far away every
pixel is."*

**9–13s.** Back to the dust. Drag the picture sideways and the helm turns in
3D. Text: *"Each speck moves by how close it is."*

**13–17s.** Switch to **Streaks** and the top of the helm starts giving off fine
trails. Text: *"524,288 points, drawn in three passes."*

**17–20s.** Drop in a new photo and it gathers in. Text: *"Try it on yours."*
