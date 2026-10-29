/**
 * The point field: a picture drawn as a few hundred thousand specks, each one
 * pushed towards you by how close the depth map says it is.
 *
 * Plain WebGL2, no scene graph. The whole effect is one `gl.POINTS` draw with
 * no vertex buffer at all: every point works out its own grid cell from
 * `gl_VertexID`, its own random numbers from a hash of that id, and its own
 * colour and depth by reading two textures. That keeps 524,288 points at the
 * cost of two textures and a uniform block, instead of 524,288 × (position +
 * colour + seed) floats shuttled to the GPU — and it means swapping pictures
 * is two `texImage2D` calls, not a rebuild.
 *
 * Nothing here knows about React. The hook owns the lifecycle and calls
 * `setPicture` / `draw`; this file is the part you'd lift into another project.
 */

/** A single-channel depth map, row 0 at the top, 255 = nearest. */
export type DepthMap = {
  data: Uint8Array | Uint8ClampedArray
  width: number
  height: number
}

export type Picture = {
  image: TexImageSource
  depth: DepthMap
  aspect: number
}

export type Vec2 = { x: number; y: number }

/**
 * The drift line, as two points in picture space: (0, 0) top left, (1, 1)
 * bottom right, and free to sit past the edges. Points on one side of it blow
 * away as a plume. Which side is set by the order of the ends: facing from `a`
 * to `b`, the plume goes to the left — so swapping them flips it.
 */
export type DriftLine = { a: Vec2; b: Vec2 }

/**
 * A shallow diagonal from the left edge down towards the bottom right,
 * blowing up and to the right: the lower left of the picture stays whole and
 * the upper right gives off dust, like smoke lifting off it.
 */
export const DEFAULT_LINE: DriftLine = {
  a: { x: -0.06, y: 0.22 },
  b: { x: 0.93, y: 0.68 },
}

/** How the points blowing off past the drift line are drawn. */
export const PARTICLES = ["subtle", "dots", "streaks", "comets"] as const
export type Particles = (typeof PARTICLES)[number]

/** The sliders (drift 0–2, reach 0.25–8, the rest 0–1), the drift line and the particle style. */
export type DustSettings = {
  drift: number
  splash: number
  cohesion: number
  depth: number
  line: DriftLine
  particles: Particles
  /** How much each plume point's direction varies, 0–1. 0.5 is the tuned look. */
  spread: number
  /** How far the plume travels, as a multiplier. */
  reach: number
  /** How wide the band where the drift starts is, 0–1. */
  softness: number
}

/**
 * The line's unit normal — the way the plume blows — measured in picture
 * space with the picture's real proportions (x scaled by `aspect`), and still
 * y-down. The line pad draws its tick with this, so the tick and the plume
 * always agree.
 */
export function lineNormal({ a, b }: DriftLine, aspect: number): Vec2 {
  const dx = (b.x - a.x) * aspect
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  return { x: dy / len, y: -dx / len }
}

export type Frame = {
  /** Seconds. Drives the sway, shimmer and twinkle; hold it still for reduced motion. */
  time: number
  /**
   * Seconds on the drift clock: how far the plume has travelled. Advanced by
   * the caller at the drift-speed rate, so speed can change without a jump.
   */
  driftTime: number
  /** 0 → 1 over the gather-in. 1 is the picture at rest. */
  intro: number
  settings: DustSettings
  /** Light theme. Switches from glowing on black to true colour on paper. */
  light: boolean
  /** Extra camera turn from dragging, in radians, added on top of the sway. */
  pan: { yaw: number; pitch: number }
  /** How strongly to show the drift line on the picture, 0–1. */
  guide: number
}

export type Field = {
  setPicture: (picture: Picture) => void
  draw: (frame: Frame) => void
  dispose: () => void
}

/** Gather's "dense" count, 2¹⁹. Enough that dark areas still read as texture. */
export const FULL_POINTS = 524_288

/**
 * 30° vertical field of view, as `1 / tan(fov / 2)`. Narrow on purpose: a wide
 * lens exaggerates the depth so much that the near parts of the picture balloon
 * towards you, and the effect stops looking like a picture at all.
 */
const FOCAL = 1 / Math.tan((30 * Math.PI) / 180 / 2)

/** How much of the canvas the picture fills, leaving room for splash to fly. */
const FILL = 0.72

/** World units of extrusion at depth 1. The picture itself is 1 unit tall. */
const MAX_EXTRUDE = 0.9

/**
 * Columns × rows that fit `points` into a picture of this aspect with square
 * cells. Square matters: non-square cells would sample the picture more
 * densely along one axis, and the grain would visibly streak.
 */
export function gridFor(aspect: number, points: number) {
  const cols = Math.max(1, Math.round(Math.sqrt(points * aspect)))
  const rows = Math.max(1, Math.floor(points / cols))
  return { cols, rows }
}

/**
 * How far back the camera sits so the picture fills `FILL` of the view in
 * whichever direction is tighter. A tall picture in a wide stage is limited by
 * height; a panorama in a narrow phone stage is limited by width.
 */
export function cameraDistance(aspect: number, viewAspect: number) {
  const byHeight = FOCAL / (2 * FILL)
  const byWidth = (aspect * FOCAL) / (2 * FILL * viewAspect)
  return Math.max(byHeight, byWidth)
}

/**
 * Per-point brightness that keeps the picture's overall exposure the same at
 * any canvas size.
 *
 * Points add up (in the dark theme they're blended additively), so the same
 * half a million of them glow twice as bright in a canvas with half the pixels.
 * `overlap` is how many points land on an average pixel of the picture; scaling
 * each point by its inverse keeps the sum near the picture's real colour. It's
 * clamped at 1 so a huge canvas gets sparse and grainy rather than over-bright,
 * which is the look we want anyway.
 */
/**
 * The picture's on-screen size in CSS pixels, face-on, for a canvas of this
 * size — where the flat original sits when you compare. Mirrors the camera:
 * a 1-unit-tall picture at `cameraDistance` spans `FOCAL / dist` of the
 * canvas's half-height.
 */
export function pictureSize(aspect: number, viewW: number, viewH: number) {
  const height = (FOCAL / cameraDistance(aspect, viewW / viewH)) * (viewH / 2)
  return { width: height * aspect, height }
}

export function pointGain(
  points: number,
  pointPx: number,
  picturePx: number
): number {
  // A soft round dot covers roughly half the area of its bounding square.
  const dotArea = pointPx * pointPx * 0.5
  const overlap = (points * dotArea) / Math.max(1, picturePx)
  return Math.min(1, Math.max(0.04, 1.1 / overlap))
}

const VERTEX = `#version 300 es
precision highp float;

uniform sampler2D uColor;
uniform sampler2D uDepth;
uniform ivec2 uGrid;
uniform float uTime;
uniform float uIntro;
uniform float uDrift;
uniform float uSplash;
uniform float uCohesion;
uniform float uExtrude;
uniform float uAspect;
uniform vec2 uSway;
uniform float uDist;
uniform float uFocal;
uniform float uViewAspect;
uniform float uPointPx;
uniform float uGain;
uniform float uLight;
uniform vec2 uLineP;
uniform vec2 uLineN;
uniform float uParticle;
uniform float uDriftTime;
uniform float uPass;
uniform float uSpread;
uniform float uReach;
uniform float uSoftness;
uniform float uGuide;

out vec4 vColor;
out float vShape;

float alphaBoost = 1.0;

// PCG hash. A sin-based hash falls apart at ids this large: sin(500000.0) has
// already lost most of its float precision, and neighbouring points end up
// with near-identical "random" numbers, which shows up as diagonal banding.
uint pcg(uint v) {
  uint state = v * 747796405u + 2891336453u;
  uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
  return (word >> 22u) ^ word;
}

float rand(uint v) {
  return float(pcg(v)) / 4294967295.0;
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  // The guide pass (uPass = 3): the drift line itself, drawn across the
  // picture while you move it in the pad, so you can see where the drift
  // starts. Two vertices, far out along the line either side of its anchor;
  // the same sway and projection as every point, so it stays glued to the
  // picture while the camera moves. It's drawn at depth 0, the picture's
  // middle — a line has no depth of its own to take.
  if (uPass > 2.5) {
    vec2 along = vec2(uLineN.y, -uLineN.x);
    vec3 p = vec3(uLineP + along * (gl_VertexID == 0 ? -4.0 : 4.0), 0.0);
    p.xz = rot(uSway.x) * p.xz;
    p.yz = rot(uSway.y) * p.yz;
    gl_Position = vec4(p.x * uFocal / uViewAspect, p.y * uFocal, 0.0, uDist - p.z);
    gl_PointSize = 1.0;
    vShape = 1.0;
    // White light on dark; on a light page, a mid grey, so it shows over both
    // the page and a dark picture (black vanished against the picture).
    vColor = uLight > 0.5 ? vec4(vec3(0.45), 0.7 * uGuide) : vec4(vec3(1.0), 0.45 * uGuide);
    return;
  }

  // The tail pass (uPass = 2) draws lines, two vertices per point: the head
  // where the point is now, and the tail end where it was a moment ago.
  bool linePass = uPass > 1.5;
  int vid = linePass ? gl_VertexID / 2 : gl_VertexID;
  float tailEnd = linePass ? 1.0 - float(gl_VertexID % 2) : 0.0;
  uint id = uint(vid);
  float r0 = rand(id);
  float r1 = rand(id ^ 0x9e3779b9u);
  float r2 = rand(id * 3u + 17u);
  float r3 = rand(id * 7u + 5u);
  float r4 = rand(id * 13u + 11u);
  float r5 = rand(id * 31u + 3u);
  float r6 = rand(id * 57u + 19u);

  // Jitter inside the cell. Without it the points sit on a perfect lattice and
  // the picture reads as a screen door; with it, as grain.
  ivec2 cell = ivec2(vid % uGrid.x, vid / uGrid.x);
  vec2 uv = (vec2(cell) + vec2(r0, r1)) / vec2(uGrid);

  vec3 rgb = texture(uColor, uv).rgb;
  float near = texture(uDepth, uv).r;
  float far = 1.0 - near;
  float lum = dot(rgb, vec3(0.299, 0.587, 0.114));

  vec3 home = vec3((uv.x - 0.5) * uAspect, 0.5 - uv.y, (near - 0.5) * uExtrude);

  // The picture itself holds its shape: no ripple, no flow. Earlier versions
  // waved the whole sheet like a flag and swam regions of it in a slow flow
  // field, which read as the picture wobbling rather than as depth. The life
  // now comes from the camera's slow sway (an animated pan, below) and the
  // plume, so the picture stays put and the dust does the moving.
  float t = uTime;
  vec3 pos = home;

  // Shimmer: the only per-point motion on the picture, kept almost entirely
  // to the background (far³) and the outline. That's what makes the dark sky
  // dissolve into dust while the near subject holds together.
  vec3 shimmer = vec3(
    sin(t * 0.9 + r2 * 6.283),
    sin(t * 0.8 + r3 * 6.283),
    sin(t * 0.7 + r4 * 6.283)
  );
  //
  // All of it is held to the neighbourhood of the drift line (nearLine). The
  // first version let the background shimmer everywhere, and on a picture with
  // a lot of dark sky that read as a smudge across areas the line was nowhere
  // near. Away from the line the picture should be as crisp as a print.
  //
  // Where the line "is" differs from point to point (feather): each one sees
  // it shifted by its own random amount, up to ±feather/2. With every point
  // agreeing on one exact line, the start of the drift showed as a seam drawn
  // with a ruler; scattered, it starts across a band, like a real edge of
  // smoke. Softness sets how wide the band is.
  float feather = 0.05 + 0.6 * uSoftness;
  float s = dot(home.xy - uLineP, uLineN) + (r3 - 0.5) * feather;
  float edge = 1.0 - smoothstep(0.0, 0.04, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
  float nearLine = smoothstep(-0.12 - 0.5 * feather, 0.05, s);
  pos += shimmer * uDrift * (0.0006 + (0.03 * far * far * far + 0.01 * edge) * nearLine);

  // The plume. Everything above only wobbles in place, and a
  // wobble reads as a still image at a glance. Past the drift line, points
  // actually leave: each rides out along the line's normal for a while, fades,
  // and reappears back home — a loop, so the picture never empties for good.
  //
  // How far past the line a point sits (side, 0–1 over 0.4 units) decides
  // both how likely it is to leave and how far it gets, so the picture thins
  // out gradually into the plume instead of being cut along a ruler. The
  // spread grows with the trip, so the plume fans out into a cone.
  //
  // Subtle is the other way to do it, after Gather: more of the points leave,
  // but each travels a short way in a narrow fan and is drawn smaller and
  // dimmer (see below), so the picture seems to give off a fine mist rather
  // than throw specks.
  //
  // The trip runs on uDriftTime, not uTime: it's a clock the page advances at
  // the drift-speed slider's rate, so changing speed changes how fast points
  // travel without every point jumping to a new spot in its loop.
  // Streaks share Subtle's plume — dense, short reach, a narrow fan — because
  // what makes Gather's trails read as fine rain is the number of them, not
  // their length.
  float subtle = 1.0 - step(0.5, uParticle) + step(1.5, uParticle) * (1.0 - step(2.5, uParticle));
  float side = clamp(s / (0.4 + 0.5 * feather), 0.0, 1.0);
  float carried = step(r6, side * uDrift * mix(0.8, 0.95, subtle));
  // The field is drawn as the picture, untouched by the plume, and then again
  // for the plume alone (uPass 1, and 2 for tails). The first version moved
  // the picture's own points away, which left black holes where they had been
  // — Gather's picture stays whole and gives off dust, so the plume has to be
  // extra points, copies of the picture, not the picture itself.
  float plume = carried * step(0.5, uPass);
  float phase = fract(uDriftTime * (0.06 + 0.08 * r1) + r4);
  // Spread scales both the fan and the lean below: 0 sends every point out
  // dead straight along the tick, 1 is a wide, wandering plume. 0.5 is the
  // look everything was tuned at.
  float wander = uSpread * 2.0;
  vec3 spread = (vec3(r2, r3, r0) - 0.5) * mix(vec3(0.5, 0.5, 0.6), vec3(0.22, 0.22, 0.3), subtle) * wander;
  vec3 heading = vec3(uLineN, 0.0) + spread;
  // Streaks travel further than Subtle's mist — Gather's trails rise about
  // half the picture's height — so their tails have room to be long.
  float streak = step(1.5, uParticle) * (1.0 - step(2.5, uParticle));
  float reach = mix(mix(0.25 + 0.9 * side, 0.05 + 0.3 * side, subtle), 0.1 + 0.6 * side, streak) * uReach;

  // Each point's path leans as it goes: a gentle curve to one side (r5 picks
  // which way and how much) that grows with the square of the distance
  // travelled, plus a faint wobble. They leave the picture nearly parallel and
  // fan out further up, like Gather's trails. Straight paths read as rain on a
  // window; a stronger curve (the first try, at 1.2) read as fur.
  //
  // Streaks and comets give some plume points a tail (r1 picks which; the
  // rest stay as fine dust, which is most of what reads as haze anyway). A
  // tail is the same path evaluated a little earlier in the trip, so it
  // follows the curve exactly — no direction to work out separately.
  float tailed = step(1.5, uParticle) * step(r1, mix(0.5, 0.6, streak));
  float span = mix(0.05, 0.25, streak) * (0.4 + side);
  float ph = max(phase - span * tailEnd, 0.0);
  vec3 across = normalize(vec3(-heading.y, heading.x, 0.0) + 1e-4);
  float curl = (r5 - 0.5) * 0.5 * wander;
  float bend = ph * ph * curl + sin(ph * 6.0 + r0 * 6.283) * 0.02 * ph;
  pos += (heading * ph + across * bend) * reach * plume;

  // Cohesion: how tightly points hold their place. Below 1, each point is pushed
  // off its spot by a fixed random amount — more so in the background — so the
  // picture loosens into a cloud around a still-readable subject. Squared, so
  // the top of the slider is fine control and the bottom falls apart quickly.
  float loose = (1.0 - uCohesion) * (1.0 - uCohesion);
  pos += (vec3(r2, r3, r4) - 0.5) * loose * (0.1 + 0.8 * far);

  // Splash: a few percent of points break away entirely and orbit the picture
  // at a distance, like specks thrown off it. r5 picks which ones, so the same
  // points stay loose as you drag the slider and more simply join them.
  if (r5 < uSplash * 0.05) {
    vec3 dir = normalize(vec3(r0, r1, r2) - 0.5 + 1e-4);
    vec3 thrown = dir * (0.08 + 0.55 * r3) * vec3(uAspect, 1.0, 1.0);
    thrown.xz = rot(t * (0.04 + 0.12 * r4)) * thrown.xz;
    pos = home + thrown;
  }

  // The gather-in. Each point starts somewhere in a box around the picture and
  // flies home along a curve: the swirl unwinds as it lands, so the cloud
  // spirals into place rather than zooming in a straight line. Staggering the
  // start (delay) is what makes it read as a swarm and not a single tween.
  float delay = r3 * 0.45;
  float k = clamp((uIntro - delay) / 0.55, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - k, 3.0);
  vec3 start = (vec3(r0, r4, r2) * 2.0 - 1.0) * vec3(uAspect * 1.1, 1.1, 1.4);
  pos = mix(start, pos, e);
  pos.xz = rot((1.0 - e) * (1.5 + 2.0 * r4)) * pos.xz;

  // The camera sway, applied as a rotation of the world. Yaw is the bigger of
  // the two because the depth reads best side-on; pitch only adds life.
  pos.xz = rot(uSway.x) * pos.xz;
  pos.yz = rot(uSway.y) * pos.yz;

  // Hand-rolled perspective: the camera sits at +uDist looking down -z, so w is
  // just the distance to the point. clip z is 0 because nothing is depth-tested
  // — with additive blending, draw order doesn't matter.
  float w = uDist - pos.z;
  gl_Position = vec4(pos.x * uFocal / uViewAspect, pos.y * uFocal, 0.0, w);

  // Bright points draw a touch larger, so highlights bloom and shadows stay
  // fine-grained.
  float size = max(1.0, uPointPx * (uDist / w) * (0.75 + 0.5 * lum));
  gl_PointSize = size;
  vShape = 0.0;

  // Plume points are fainter than the picture they come off — it's dust in
  // the air, not more picture — and in Subtle and Streaks they're smaller
  // still, so they blend into a haze instead of reading as specks.
  if (plume > 0.5) alphaBoost = mix(0.9, 0.75, subtle);
  if (plume > 0.5 && subtle > 0.5) gl_PointSize = max(1.0, size * 0.6);

  // A comet's head: a bigger, softer, brighter dot where its tail starts.
  if (uPass > 0.5 && !linePass && plume > 0.5 && tailed > 0.5 && streak < 0.5) {
    gl_PointSize = size * 2.2;
    vShape = 2.0;
  }

  // Tails are 1px lines from where the point was to where it is, bright at
  // the head and fading to nothing. The first version drew each tail inside a
  // point sprite as big as the tail — a square, so a 100px tail cost 10,000
  // pixels to draw a 100px line, and panning stuttered. A real line costs
  // only its length, and a 1px hairline is the look anyway.
  if (linePass) {
    vShape = 1.0;
    alphaBoost = mix(0.9, 0.6, streak) * (1.0 - tailEnd);
  }

  // Exposure. Spread into grain, the picture loses about half its apparent
  // brightness to the gaps between points; this puts it back, and a little
  // over, so the highlights bloom the way light does. The power curve is there
  // because a flat boost lifted the shadows too, and a dark sky turned into an
  // even blue wash with the subject lost in it.
  float twinkle = 0.85 + 0.15 * sin(t * 1.7 + r0 * 40.0);
  // The plume's fade: in quickly as a point sets off, out slowly as it goes,
  // so the trip back home at the end of the loop is never seen.
  float fade = mix(1.0, smoothstep(0.0, 0.08, phase) * (1.0 - phase), plume);
  float alpha = uGain * twinkle * fade * alphaBoost;
  vec3 glow = pow(rgb, vec3(1.35)) * 2.5;

  // On paper, points are opaque flecks of the picture's true colour, stacked
  // over the page, and the plume is specks of that colour drifting over it.
  // This was tried early on and dropped for an "ink" negative, because the
  // points left gaps (salt-and-pepper noise) and the plume moved the picture's
  // own points away (tears). With overlapping points and the plume drawn as
  // extra copies, neither happens any more, and an inverted picture was the
  // wrong answer to the question "what does this look like on a light page".
  // No exposure curve here: light is already the page, so the picture's own
  // colours are the right ones.
  if (uLight > 0.5) {
    // Loose specks (splash and plume) are mostly the picture's darks, and on
    // white, full-strength dark specks read as dirt on the page; faded, they
    // read as dust.
    float speck = max(plume, step(r5, uSplash * 0.05));
    vColor = vec4(rgb, min(fade * alphaBoost * mix(1.0, 0.45, speck), 1.0));
  } else {
    vColor = vec4(glow, min(alpha, 1.0));
  }

  // The plume pass only draws plume points. w < 0 puts everything else behind
  // the camera, where the GPU clips it before any pixel work.
  if ((uPass > 0.5 && carried < 0.5) || (linePass && (tailed < 0.5 || e < 0.99))) {
    gl_Position = vec4(0.0, 0.0, 0.0, -1.0);
    gl_PointSize = 0.0;
  }
}
`

const FRAGMENT = `#version 300 es
precision highp float;

in vec4 vColor;
in float vShape;
out vec4 outColor;

// 0 = dot, 1 = tail line (shaded entirely by its vertex colours), 2 = comet
// head: a softer, brighter dot.
float shape() {
  if (vShape > 0.5 && vShape < 1.5) return 1.0;
  vec2 d = gl_PointCoord - 0.5;
  float r2 = dot(d, d);
  if (vShape > 1.5) return (1.0 - smoothstep(0.0, 0.25, r2)) * 1.4;
  // A soft edge with a solid middle. Fully soft dots turn to fog in their
  // hundreds of thousands; hard ones show every gap between them.
  return 1.0 - smoothstep(0.06, 0.25, r2);
}

void main() {
  float a = vColor.a * shape();
  if (a <= 0.0) discard;
  // Premultiplied, to match the canvas. The page then composites as
  // rgb + page × (1 − alpha): on dark, the rgb is the glow; on light, each
  // point covers the page with its own colour.
  outColor = vec4(vColor.rgb * a, a);
}
`

/** Longest side the picture texture is stored at. More is wasted on 1M points. */
const MAX_TEXTURE = 1024

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error("Could not create shader")
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "Shader failed to compile")
  }
  return shader
}

function link(gl: WebGL2RenderingContext) {
  const program = gl.createProgram()
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX))
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "Program failed to link")
  }
  return program
}

function texture(gl: WebGL2RenderingContext) {
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return tex
}

/**
 * Downscale the picture before upload. A 6000px phone photo is 140MB of
 * texture for points that sample it at most a thousand times across.
 */
function fitTexture(image: TexImageSource, aspect: number): TexImageSource {
  const w = Math.round(aspect >= 1 ? MAX_TEXTURE : MAX_TEXTURE * aspect)
  const h = Math.round(aspect >= 1 ? MAX_TEXTURE / aspect : MAX_TEXTURE)
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  canvas.getContext("2d")?.drawImage(image as CanvasImageSource, 0, 0, w, h)
  return canvas
}

/**
 * Set up a field on `canvas`, or `null` when the browser has no WebGL2.
 * `points` is the budget; the real count is the largest grid that fits it.
 */
export function createField(
  canvas: HTMLCanvasElement,
  points = FULL_POINTS
): Field | null {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    premultipliedAlpha: true,
    alpha: true,
  })
  if (!gl) return null

  const program = link(gl)
  const vao = gl.createVertexArray()
  const colorTex = texture(gl)
  const depthTex = texture(gl)
  const at = (name: string) => gl.getUniformLocation(program, name)
  const u = {
    color: at("uColor"),
    depth: at("uDepth"),
    grid: at("uGrid"),
    time: at("uTime"),
    intro: at("uIntro"),
    drift: at("uDrift"),
    splash: at("uSplash"),
    cohesion: at("uCohesion"),
    extrude: at("uExtrude"),
    aspect: at("uAspect"),
    sway: at("uSway"),
    dist: at("uDist"),
    focal: at("uFocal"),
    viewAspect: at("uViewAspect"),
    pointPx: at("uPointPx"),
    gain: at("uGain"),
    light: at("uLight"),
    lineP: at("uLineP"),
    lineN: at("uLineN"),
    particle: at("uParticle"),
    driftTime: at("uDriftTime"),
    pass: at("uPass"),
    spread: at("uSpread"),
    reach: at("uReach"),
    softness: at("uSoftness"),
    guide: at("uGuide"),
  }

  let grid = { cols: 0, rows: 0 }
  let aspect = 1

  const setPicture = (picture: Picture) => {
    aspect = picture.aspect
    grid = gridFor(aspect, points)

    gl.bindTexture(gl.TEXTURE_2D, colorTex)
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      fitTexture(picture.image, aspect)
    )

    // One byte per row pixel, so rows aren't 4-byte aligned for most widths.
    gl.bindTexture(gl.TEXTURE_2D, depthTex)
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R8,
      picture.depth.width,
      picture.depth.height,
      0,
      gl.RED,
      gl.UNSIGNED_BYTE,
      new Uint8Array(picture.depth.data)
    )
  }

  const draw = ({
    time,
    driftTime,
    intro,
    settings,
    light,
    pan,
    guide,
  }: Frame) => {
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }

    gl.viewport(0, 0, w, h)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    if (!grid.cols) return

    const viewAspect = w / h
    const dist = cameraDistance(aspect, viewAspect)
    const pictureH = (FOCAL / dist) * (h / 2)
    // Big enough that neighbours overlap. At 1.1px the gaps between points
    // showed and the picture read as separate specks; overlapping, with the
    // gain below scaling each one down to match, it reads as fine film grain.
    const pointPx = 1.6 * dpr
    const count = grid.cols * grid.rows

    gl.useProgram(program)
    gl.bindVertexArray(vao)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, colorTex)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, depthTex)
    gl.uniform1i(u.color, 0)
    gl.uniform1i(u.depth, 1)
    gl.uniform2i(u.grid, grid.cols, grid.rows)
    gl.uniform1f(u.time, time)
    gl.uniform1f(u.intro, intro)
    gl.uniform1f(u.drift, settings.drift)
    gl.uniform1f(u.splash, settings.splash)
    gl.uniform1f(u.cohesion, settings.cohesion)
    gl.uniform1f(u.extrude, settings.depth * MAX_EXTRUDE)
    gl.uniform1f(u.aspect, aspect)
    gl.uniform2f(
      u.sway,
      Math.sin(time * 0.21) * 0.22 + Math.sin(time * 0.13) * 0.08 + pan.yaw,
      Math.sin(time * 0.17) * 0.07 + pan.pitch
    )
    gl.uniform1f(u.dist, dist)
    gl.uniform1f(u.focal, FOCAL)
    gl.uniform1f(u.viewAspect, viewAspect)
    gl.uniform1f(u.pointPx, pointPx)
    gl.uniform1f(
      u.gain,
      pointGain(count, pointPx, pictureH * pictureH * aspect)
    )
    gl.uniform1f(u.light, light ? 1 : 0)

    // Picture space → world: x scaled by aspect and centred, y flipped to point
    // up. The normal is already aspect-correct, so it only needs the flip.
    const { a } = settings.line
    const normal = lineNormal(settings.line, aspect)
    gl.uniform2f(u.lineP, (a.x - 0.5) * aspect, 0.5 - a.y)
    gl.uniform2f(u.lineN, normal.x, -normal.y)
    gl.uniform1f(u.particle, PARTICLES.indexOf(settings.particles))
    gl.uniform1f(u.driftTime, driftTime)
    gl.uniform1f(u.spread, settings.spread)
    gl.uniform1f(u.reach, settings.reach)
    gl.uniform1f(u.softness, settings.softness)
    gl.uniform1f(u.guide, guide)

    // Dark: additive. Every point is a little glow, and where they pile up the
    // picture gets brighter, exactly like exposure — and draw order never
    // matters, so there's no depth sorting to do. Light: "over", so each point
    // is a fleck of real colour laid on the page. Order matters a little there,
    // but points are tiny and neighbours share colours, so it doesn't show.
    gl.enable(gl.BLEND)
    if (light) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    else gl.blendFunc(gl.ONE, gl.ONE)

    gl.uniform1f(u.pass, 0)
    gl.drawArrays(gl.POINTS, 0, count)
    if (settings.drift > 0) {
      gl.uniform1f(u.pass, 1)
      gl.drawArrays(gl.POINTS, 0, count)
      if (settings.particles === "streaks" || settings.particles === "comets") {
        gl.uniform1f(u.pass, 2)
        gl.drawArrays(gl.LINES, 0, count * 2)
      }
    }
    if (guide > 0) {
      gl.uniform1f(u.pass, 3)
      gl.drawArrays(gl.LINES, 0, 2)
    }
  }

  const dispose = () => {
    gl.deleteTexture(colorTex)
    gl.deleteTexture(depthTex)
    gl.deleteVertexArray(vao)
    gl.deleteProgram(program)
  }

  return { setPicture, draw, dispose }
}
