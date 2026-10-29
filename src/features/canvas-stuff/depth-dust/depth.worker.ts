import { loadEstimator } from "./model"
import type { Estimator } from "./model"

export type DepthRequest = { id: number; url: string }

export type DepthResponse =
  | { id: number; kind: "progress"; progress: number }
  | {
      id: number
      kind: "done"
      data: Uint8Array
      width: number
      height: number
    }
  | { id: number; kind: "error" }

// The DOM lib types `self` as a window, whose postMessage takes an origin, not
// a transfer list. This is the shape it really has in a worker.
const scope = self as unknown as {
  postMessage: (message: DepthResponse, transfer?: Transferable[]) => void
  onmessage: ((event: MessageEvent<DepthRequest>) => void) | null
}

let estimator: Promise<Estimator> | null = null
let current = 0

scope.onmessage = async ({ data: { id, url } }) => {
  current = id
  try {
    estimator ??= loadEstimator((progress) =>
      scope.postMessage({ id: current, kind: "progress", progress })
    )
    const estimate = await estimator
    const { data, width, height } = await estimate(url)
    const bytes = new Uint8Array(data)
    scope.postMessage({ id, kind: "done", data: bytes, width, height }, [
      bytes.buffer,
    ])
  } catch {
    // Forget a failed load so the next picture tries again — a dropped
    // connection shouldn't break the tool until the page is reloaded.
    estimator = null
    scope.postMessage({ id, kind: "error" })
  }
}
