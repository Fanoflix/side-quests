import { pipeline } from "@huggingface/transformers"

import type { DepthMap } from "./field"

/** Depth Anything V2, small: the best depth you can get in a browser tab. */
const MODEL = "onnx-community/depth-anything-v2-small"

/**
 * On the GPU, half-precision weights (~50MB). Measured on the default
 * pictures: 0.4s for the first estimate, under 0.3s after. On the CPU
 * (WebAssembly) the same estimate took 11s on the main thread and 35s in a
 * worker, so the GPU is the only path that feels instant. Without WebGPU we
 * fall back to the 8-bit weights (~27MB), which are the fastest the CPU path
 * gets — slow, but it still works everywhere.
 */
const GPU = { device: "webgpu", dtype: "fp16" } as const
const CPU = { device: "wasm", dtype: "q8" } as const

export type Estimator = (url: string) => Promise<DepthMap>

type Pipe = (url: string) => Promise<{
  depth: { data: Uint8Array | Uint8ClampedArray; width: number; height: number }
}>

/**
 * Load the depth model, reporting download progress (0–1) across every file
 * it's made of. Shared by the tool's worker and the published package.
 *
 * `navigator.gpu` existing doesn't guarantee an adapter (blocklisted drivers,
 * some Linux setups), so a failed GPU load falls back to the CPU rather than
 * failing the picture.
 */
export async function loadEstimator(
  onProgress: (progress: number) => void
): Promise<Estimator> {
  const files = new Map<string, { loaded: number; total: number }>()
  const create = (options: typeof GPU | typeof CPU) =>
    pipeline("depth-estimation", MODEL, {
      ...options,
      progress_callback: (event) => {
        if (event.status !== "progress") return
        files.set(event.file, { loaded: event.loaded, total: event.total })
        let loaded = 0
        let total = 0
        for (const file of files.values()) {
          loaded += file.loaded
          total += file.total
        }
        onProgress(total ? loaded / total : 0)
      },
    })
  const onGpu = "gpu" in navigator
  let pipe = (await (onGpu
    ? create(GPU).catch(() => create(CPU))
    : create(CPU))) as unknown as Pipe

  // A GPU can also load the model fine and then fail on the first real
  // estimate. Switch to the CPU for good the first time that happens, rather
  // than failing every picture after it.
  let fellBack = !onGpu
  const run = async (url: string) => {
    try {
      return await pipe(url)
    } catch (error) {
      if (fellBack) throw error
      fellBack = true
      pipe = await create(CPU)
      return pipe(url)
    }
  }

  return async (url) => {
    const { depth } = await run(url)
    return {
      data: new Uint8Array(depth.data),
      width: depth.width,
      height: depth.height,
    }
  }
}
