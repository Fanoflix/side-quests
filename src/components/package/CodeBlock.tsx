import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCopy } from "@/hooks/useCopy"

/**
 * A copyable block of code: usage snippets, setup commands, anything people
 * will paste. Prose with code in it read as a caption and got retyped; a box
 * with a Copy button reads as the thing to take.
 */
export function CodeBlock({ code }: { code: string }) {
  const { copied, copy } = useCopy<"code">()

  return (
    <div className="relative border border-border bg-muted/30">
      <pre className="overflow-x-auto p-4 pr-24 font-mono text-sm leading-relaxed">
        {code}
      </pre>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => copy("code", code)}
        className="absolute top-2 right-2"
      >
        {copied ? <Check /> : <Copy />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  )
}
