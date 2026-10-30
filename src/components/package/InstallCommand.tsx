import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCopy } from "@/hooks/useCopy"

/**
 * The install line, set as a terminal command: a bordered code box with a
 * `$` prompt and a copy button. Plain inline text read as a caption, not as
 * something to run.
 */
export function InstallCommand({ command }: { command: string }) {
  const { copied, copy } = useCopy<"command">()

  return (
    <div className="flex items-center justify-between gap-3 border border-border bg-muted/30 py-2 pr-2 pl-4">
      <code className="min-w-0 truncate font-mono text-sm">
        <span className="text-muted-foreground select-none">$ </span>
        {command}
      </code>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => copy("command", command)}
        aria-label="Copy install command"
      >
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  )
}
