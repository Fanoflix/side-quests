# side-quests-lab

Small React effects from [Side Quests](https://fanoflix.github.io/side-quests/),
each one a single component.

- **DepthDust**: a picture as half a million points of light that sway in 3D
  and blow away past a line.
- **CharacterFlow**: NumberFlow, but for words.
- **StyleFlow**: a per-letter shimmer across weight, slant, family and size.

```bash
npm i side-quests-lab motion
```

Needs React 18 or later and [`motion`](https://motion.dev) 12 or later.

## DepthDust

```tsx
import { DepthDust } from "side-quests-lab"

export function Hero() {
  return <DepthDust src="/helm.jpg" depthMap="/helm-depth.png" />
}
```

`depthMap` is a greyscale image of how far away each pixel is: white is near,
black is far. To make one for a picture you already have:

```bash
npm i -D @huggingface/transformers
npx side-quests-lab depth helm.jpg helm-depth.png
```

To make one in the browser instead, for pictures your visitors upload:

```tsx
import { DepthDust } from "side-quests-lab"
import { estimateDepth } from "side-quests-lab/estimate"

<DepthDust src={uploadedUrl} depthMap={estimateDepth} />
```

That also needs `@huggingface/transformers`. It runs on WebGPU where the
browser has it (well under a second per picture) and on WebAssembly
otherwise (several seconds). The first picture downloads the model, about
50MB, which the browser then caches.

It fills its container's width and is 16:10 unless you give it a height.

| Prop         | Default      | What it does                                                        |
| ------------ | ------------ | ------------------------------------------------------------------- |
| `src`        | required     | The picture. Same-origin or CORS-enabled.                           |
| `depthMap`   | required     | A depth-map URL, a `DepthMap`, or a function that returns one.      |
| `drift`      | `0.72`       | How much the dust moves and blows off, 0 to 2.                      |
| `splash`     | `0.15`       | Share of points thrown loose to orbit the picture.                  |
| `gather`     | `0.95`       | How tightly points hold their place.                                |
| `depth`      | `0.84`       | How far near things push towards you.                               |
| `line`       | diagonal     | Past this line the picture gives off a plume. See below.            |
| `particles`  | `"comets"`   | `"subtle"`, `"dots"`, `"streaks"` or `"comets"`.                    |
| `driftSpeed` | `3.45`       | How fast the plume travels.                                         |
| `reach`      | `0.25`       | How far the plume travels, 0.25 to 8.                               |
| `spread`     | `0.25`       | How much each particle's direction varies. 0 is dead straight.      |
| `softness`   | `0.5`        | How wide the band where the drift starts is. 0 is a sharp line.     |
| `theme`      | `"dark"`     | `"dark"` glows on black, `"light"` is true colour on a light page.  |
| `pan`        | `true`       | Drag to turn the picture.                                           |
| `panSpeed`   | `1`          | How far a drag turns it.                                            |
| `angle`      | turned right | The resting view in radians, `{ yaw, pitch }`. The sway moves around it. |
| `points`     | `524288`     | Point budget. Fewer is lighter on phones.                           |
| `playToken`  | `0`          | Change it to replay the gather-in.                                  |
| `onError`    |              | Called if the picture or depth map fails, or WebGL2 is missing.     |

`line` is two points in picture space, where `{ x: 0, y: 0 }` is the top left
and `{ x: 1, y: 1 }` the bottom right. They can sit past the edges. Facing from
`a` to `b`, the plume blows to the left; swap them to flip it.

```tsx
<DepthDust
  src="/helm.jpg"
  depthMap="/helm-depth.png"
  line={{ a: { x: 0, y: 0.4 }, b: { x: 1, y: 0.4 } }}
  particles="streaks"
/>
```

## CharacterFlow

```tsx
import { CharacterFlow } from "side-quests-lab"

<CharacterFlow value={status} />
```

Change `value` and each letter rolls through the alphabet to its new one,
while letters both words share slide to their new spot. It takes its font,
size and colour from its parent. Options include `duration`, `ease`, `stagger`,
`trend` (`"up"`, `"down"` or `"auto"`) and `animated`.

## StyleFlow

```tsx
import { StyleFlow } from "side-quests-lab"

<StyleFlow value="Shimmer" sizeRange={[40, 56]} />
```

Each letter drifts between weights, slants, a sans and a serif, then settles.
It needs two variable fonts: a sans with `wght` and `slnt` axes, and a serif
with `wght` and an italic. By default it uses Recursive and Fraunces:

```bash
npm i @fontsource-variable/recursive @fontsource-variable/fraunces
```

```ts
import "@fontsource-variable/recursive/full.css"
import "@fontsource-variable/fraunces/full.css"
import "@fontsource-variable/fraunces/full-italic.css"
```

The `full` builds matter: the default Recursive build has no `slnt` axis, so
slants would do nothing.

Use your own with the `fonts` prop, or set `--style-flow-sans` and
`--style-flow-serif` in CSS.

All three honour the visitor's reduced-motion setting.

## Licence

Apache 2.0. DepthDust is inspired by [Gather](https://gather.be-of-dao.com)
by DAO.
