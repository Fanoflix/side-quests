import { loadEstimator } from "../../../src/features/canvas-stuff/depth-dust/model"
import type { Estimator } from "../../../src/features/canvas-stuff/depth-dust/model"
import type { DepthMap } from "../../../src/features/canvas-stuff/depth-dust/field"

let estimator: Promise<Estimator> | null = null
// Whoever is waiting right now hears the download progress. The model loads
// once, so the callback can't be baked in at load time: it would keep talking
// to the first caller only.
let report: ((progress: number) => void) | undefined

/**
 * Work out a depth map for any picture, in the browser, with Depth Anything V2.
 * Pass it straight to `<DepthDust depthMap={estimateDepth} />`.
 *
 * Needs `@huggingface/transformers` installed. Uses WebGPU when the browser
 * has it (well under a second per picture) and falls back to WebAssembly
 * (several seconds, and the page is busy meanwhile). The first call downloads
 * the model — about 50MB on WebGPU, 27MB otherwise — which the browser then
 * caches. For a picture you know ahead of time, a pre-made map is faster:
 * `npx side-quests-lab depth picture.jpg depth.png`.
 */
export async function estimateDepth(
  src: string,
  onProgress?: (progress: number) => void
): Promise<DepthMap> {
  report = onProgress
  estimator ??= loadEstimator((progress) => report?.(progress)).catch(
    (error: unknown) => {
      estimator = null
      throw error
    }
  )
  const estimate = await estimator
  return estimate(src)
}
