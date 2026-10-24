# How low-res video works

This tool turns any video into a **dot screen**: the look of an LED video wall,
a stadium scoreboard, or a Lite-Brite. It does it in two moves. First it shrinks
the video to a tiny grid of colours, then it blows each of those colours back up
as a single **dot** on a dark background.

The maths lives in [`screen.ts`](./screen.ts) and the drawing in
[`useDotScreen.ts`](./useDotScreen.ts).

---

## The detail

### Terms (read these first)

- `cols`, `rows` = "the low-res grid: how many dots across and down. This _is_ the real resolution. Everything else is just how big we draw it."
- `dpr` = "device pixel ratio: how many physical pixels there are per CSS pixel (2 on most laptops)."
- `area` = "the space the screen is allowed to fill, in CSS pixels."
- `cell` = "the square of physical pixels one grid colour gets blown up into. Always a whole number."
- `fill` = "how much of its cell a dot covers, from 20% to 100%. The rest is the dark gap."
- `tile` = "one cell with one dot drawn in it, repeated across the whole screen as a pattern."

### Step 1: shrink the video to a grid of colours

Every frame, the video is drawn into a canvas that is exactly `cols × rows`
pixels big:

```
drawImage(video, crop…, 0, 0, cols, rows)     imageSmoothingQuality = "high"
```

To fit, the browser blends each patch of the video into one colour, so a
1920-wide frame squeezed into 64 columns gives each dot the blend of a 30 × 30
patch. If the grid has a different shape from the video, the video is cropped to
fill it (like `object-fit: cover`) instead of being squashed.

That tiny canvas is the whole picture now. It never leaves the GPU: nothing reads
its pixels back into JavaScript.

### Step 2: pick a cell size that fits both ways

The cell has to fit the grid inside the area in **both** directions, and it has
to be a whole number of physical pixels:

```
cell = floor( min( area.w · dpr / cols,  area.h · dpr / rows ) )
screen = cols · cell  ×  rows · cell          (physical pixels)
```

Taking the smaller of the two keeps every dot square, whatever the grid's shape.
Rounding down means the screen can never be bigger than its area, so the browser
never has to shrink it, which is what used to make dots blur into each other.
The whole number matters too: if cells were 12.7 pixels wide, every dot would
land on a slightly different pixel boundary and the grid would shimmer.

The sliders stop where a dot would get smaller than 3 CSS pixels:

```
max cols = floor( area.w / 3 )      max rows = floor( area.h / 3 )
```

When the grid is locked to the video's shape, rows follow columns
(`rows = round(cols / videoAspect)`), and columns stop early enough that those
rows still fit.

### Step 3: blow the colours up and punch out the dots

Two GPU operations per frame, no per-pixel JavaScript:

```
1. draw the tiny canvas at cols·cell × rows·cell   (smoothing off → hard squares)
2. fill the screen with the dot tile, using "destination-in"
```

`destination-in` keeps the existing pixels only where the new drawing is
opaque. The tile is one cell with one dot shape in it, so every square is
trimmed down to a dot and everything around it turns transparent. The tile is
drawn once per change of shape, fill or cell size and reused every frame:

```
square   :  a box of size  cell · fill
circle   :  a circle of diameter  cell · fill
diamond  :  a square of the same size, turned 45°
```

### Step 4: the glow

The tiny canvas from step 1 is also put on screen, behind the dots, stretched to
the same size with smoothing on and a CSS blur of about one cell. It already
holds every colour, so the glow costs nothing to compute. It just leaks a soft
version of each dot's colour into the gaps, the way light spills around a real
LED.

### Why it works in one sentence

Shrinking blends the video into a handful of honest colours, and drawing each
one as a lone dot on black lets your eye merge the dots back into the moving
image, the same way a real LED wall does.
