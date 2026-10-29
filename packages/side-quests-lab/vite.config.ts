import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import viteReact from "@vitejs/plugin-react"

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [viteReact()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    lib: {
      entry: { index: "src/index.ts", estimate: "src/estimate.ts" },
      formats: ["es"],
    },
    rolldownOptions: {
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^motion($|\/)/,
        /^@huggingface\/transformers/,
      ],
      output: { banner: '"use client";' },
    },
  },
})
