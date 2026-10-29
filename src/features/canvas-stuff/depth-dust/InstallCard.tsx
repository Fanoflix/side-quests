import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useInstallCard } from "./useInstallCard"
import type { SnippetInput } from "./snippet"

export function InstallCard(props: SnippetInput) {
  const { install, snippet, copied, copy } = useInstallCard(props)

  return (
    <section className="flex flex-col gap-4 border-y border-border py-5">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-medium">Put it on your own site</h2>
          <span className="border border-border px-1.5 py-px text-[11px] text-muted-foreground">
            Coming soon to npm
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          It's a React component. The snippet follows the controls, so tune it
          here and copy what you see.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 border border-border bg-muted/30 py-2 pr-2 pl-4">
        <code className="font-mono text-sm">
          <span className="text-muted-foreground">$ </span>
          {install}
        </code>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copy("install")}
          aria-label="Copy install command"
        >
          {copied === "install" ? <Check /> : <Copy />}
        </Button>
      </div>

      <div className="relative border border-border bg-muted/30">
        <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
          {snippet}
        </pre>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copy("snippet")}
          className="absolute top-2 right-2"
        >
          {copied === "snippet" ? <Check /> : <Copy />}
          {copied === "snippet" ? "Copied" : "Copy"}
        </Button>
      </div>
    </section>
  )
}
