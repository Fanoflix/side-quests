#!/usr/bin/env node
import { resolve } from "node:path"

const [command, input, output] = process.argv.slice(2)

if (command !== "depth" || !input || !output) {
  console.error("usage: side-quests-lab depth <picture> <out.png>")
  process.exit(1)
}

let pipeline
try {
  ;({ pipeline } = await import("@huggingface/transformers"))
} catch {
  console.error(
    "side-quests-lab depth needs @huggingface/transformers:\n  npm i -D @huggingface/transformers"
  )
  process.exit(1)
}

const estimate = await pipeline(
  "depth-estimation",
  "onnx-community/depth-anything-v2-small",
  { dtype: "q8" }
)
const { depth } = await estimate(resolve(input))
await depth.save(resolve(output))
console.log(`${output}: ${depth.width}×${depth.height}`)
