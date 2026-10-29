import type { DepthMap } from "./field"
import type { DepthRequest, DepthResponse } from "./depth.worker"

/**
 * The model runs in a worker. On the main thread, one estimate held the page
 * for several seconds — the dust froze mid-drift, and the browser couldn't
 * even repaint the "working it out" message that was meant to cover the wait.
 *
 * The worker, and the ~1MB library and WebAssembly runtime it imports, are only
 * created on first use. Most visitors never drop in a picture of their own —
 * the default one ships with its depth map already worked out (`yarn depth`) —
 * so it shouldn't cost anyone a download.
 */
let worker: Worker | null = null
let nextId = 0

type Pending = {
  resolve: (depth: DepthMap) => void
  reject: (error: Error) => void
  onProgress: (progress: number) => void
}

const pending = new Map<number, Pending>()

function getWorker() {
  if (worker) return worker
  worker = new Worker(new URL("./depth.worker.ts", import.meta.url), {
    type: "module",
  })
  worker.onmessage = ({ data }: MessageEvent<DepthResponse>) => {
    const request = pending.get(data.id)
    if (!request) return
    if (data.kind === "progress") {
      request.onProgress(data.progress)
      return
    }
    pending.delete(data.id)
    if (data.kind === "done") {
      request.resolve({
        data: data.data,
        width: data.width,
        height: data.height,
      })
    } else {
      request.reject(new Error("Depth estimate failed"))
    }
  }
  // A worker that fails to load or crashes never answers, which used to leave
  // the picture stuck on "working it out" forever. Fail everything waiting and
  // start a fresh worker for the next picture.
  worker.onerror = () => {
    for (const request of pending.values()) {
      request.reject(new Error("Depth worker failed"))
    }
    pending.clear()
    worker?.terminate()
    worker = null
  }
  return worker
}

/**
 * Work out how far away each pixel of `url` is. `onProgress` hears about the
 * model download (0–1) the first time; after that the model is cached by the
 * browser and it goes straight to the estimate.
 *
 * `url` can be an object URL: blob URLs made on the page are readable from a
 * same-origin worker, so the file never has to be copied across.
 */
export function estimateDepth(
  url: string,
  onProgress: (progress: number) => void
): Promise<DepthMap> {
  const id = nextId++
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, onProgress })
    getWorker().postMessage({ id, url } satisfies DepthRequest)
  })
}
