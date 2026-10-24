import { marked } from "marked"

const sources = import.meta.glob<string>("/src/features/**/explainer.md", {
  query: "?raw",
  import: "default",
  eager: true,
})

const bySlug = new Map(
  Object.entries(sources).map(([path, markdown]) => [
    path.split("/").at(-2) ?? "",
    markdown,
  ])
)

export type Explainer = { hook: string; html: string }

const cache = new Map<string, Explainer>()

export function getExplainer(slug: string): Explainer | null {
  const cached = cache.get(slug)
  if (cached) return cached
  const markdown = bySlug.get(slug)
  if (!markdown) return null
  const [first, ...rest] = markdown.trim().split("\n")
  const explainer = {
    hook: first.replace(/^#+\s*/, ""),
    html: marked
      .parse(rest.join("\n").trim(), { async: false })
      .replaceAll(
        '<a href="http',
        '<a target="_blank" rel="noreferrer" href="http'
      ),
  }
  cache.set(slug, explainer)
  return explainer
}
