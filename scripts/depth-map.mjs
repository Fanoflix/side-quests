import { join } from "node:path"
import { pipeline } from "@huggingface/transformers"

const MODEL = "onnx-community/depth-anything-v2-small"
const [input, output] = process.argv.slice(2)

if (!input || !output) {
  console.error("usage: yarn depth <image> <out.png>")
  process.exit(1)
}

const estimate = await pipeline("depth-estimation", MODEL, { dtype: "q8" })
const { depth } = await estimate(join(process.cwd(), input))
await depth.save(join(process.cwd(), output))
console.log(`${output}: ${depth.width}×${depth.height}`)
