import { getExplainer } from "./explainers"

export function HowItWorks({ slug }: { slug: string }) {
  const explainer = getExplainer(slug)
  if (!explainer) return null

  return (
    <article id="how-it-works" className="scroll-mt-20 space-y-6">
      <header className="space-y-2 border-t border-border pt-10">
        <p className="text-xs text-muted-foreground">How it works</p>
        <h2 className="text-2xl font-medium tracking-tight text-balance">
          {explainer.hook}
        </h2>
      </header>
      <div
        className="explainer"
        dangerouslySetInnerHTML={{ __html: explainer.html }}
      />
    </article>
  )
}
