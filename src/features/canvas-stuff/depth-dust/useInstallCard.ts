import { useCopy } from "@/hooks/useCopy"
import { INSTALL, depthDustSnippet } from "./snippet"
import type { SnippetInput } from "./snippet"

/**
 * The "use it in your app" card: the install line and a snippet of the
 * component as currently tuned. The install line copies itself (see
 * `InstallCommand`); the snippet's button says "Copied" for a moment after
 * it works.
 */
export function useInstallCard(input: SnippetInput) {
  const { copied, copy } = useCopy<"snippet">()
  const snippet = depthDustSnippet(input)

  return {
    install: INSTALL,
    snippet,
    copied: copied === "snippet",
    copySnippet: () => copy("snippet", snippet),
  }
}
