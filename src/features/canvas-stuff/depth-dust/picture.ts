import type { DepthMap } from "./field"

export function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    // Without CORS mode, a cross-origin picture taints the canvas it's drawn
    // to, and uploading it to WebGL or reading its pixels throws — even when
    // the server allows it. Same-origin and blob URLs are unaffected.
    image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = url
  })
}

/** A greyscale PNG decodes to RGBA; the depth is any one channel of it. */
export async function loadDepth(url: string): Promise<DepthMap> {
  const image = await loadImage(url)
  const canvas = document.createElement("canvas")
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("No 2D context")
  ctx.drawImage(image, 0, 0)
  const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const data = new Uint8Array(canvas.width * canvas.height)
  for (let i = 0; i < data.length; i++) data[i] = rgba[i * 4]
  return { data, width: canvas.width, height: canvas.height }
}

/**
 * A depth map as a greyscale PNG, the same format `yarn depth` writes and the
 * component reads back: one byte of depth copied into R, G and B.
 */
export function depthToPng({ data, width, height }: DepthMap): Promise<Blob> {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return Promise.reject(new Error("No 2D context"))
  const rgba = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i++) {
    rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = data[i]
    rgba[i * 4 + 3] = 255
  }
  ctx.putImageData(new ImageData(rgba, width, height), 0, 0)
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encode failed"))),
      "image/png"
    )
  )
}
