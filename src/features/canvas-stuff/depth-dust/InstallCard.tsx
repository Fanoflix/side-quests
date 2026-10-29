import type { ReactNode } from "react"
import { Check, Copy, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { depthFileName } from "./snippet"
import { useInstallCard } from "./useInstallCard"
import type { SnippetInput } from "./snippet"

type Props = SnippetInput & {
  hasPicture: boolean
  onDownloadDepth: () => void
}

function Step({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children: ReactNode
}) {
  return (
    <li className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">
        <span className="text-muted-foreground tabular-nums">{n}. </span>
        {title}
      </h3>
      {children}
    </li>
  )
}

function Inline({ children }: { children: ReactNode }) {
  return (
    <code className="bg-muted/50 px-1 py-px font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  )
}

export function InstallCard({ hasPicture, onDownloadDepth, ...input }: Props) {
  const { install, snippet, copied, copy } = useInstallCard(input)
  const depthName = depthFileName(input.pictureName)

  return (
    <section className="flex flex-col gap-5 border-y border-border py-5">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-medium">Put it on your own site</h2>
          <span className="border border-border px-1.5 py-px text-[11px] text-muted-foreground">
            Coming soon to npm
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          It's a React component. Tune it here, then follow these three steps.
          The snippet follows the controls, so it's always what you see.
        </p>
      </div>

      <ol className="flex flex-col gap-5">
        <Step n={1} title="Install it">
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
        </Step>

        <Step n={2} title="Get your picture's depth map">
          <p className="text-sm text-muted-foreground">
            The dust needs to know how far away each part of the picture is: a
            grey copy of it where white is near and black is far. Drop your own
            picture in above, then download its map. It works out the depth
            right here in your browser.
          </p>
          <Button
            variant="outline"
            className="self-start"
            disabled={!hasPicture}
            onClick={onDownloadDepth}
          >
            <Download />
            Download {depthName}
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Rather script it?{" "}
            <Inline>npm i -D @huggingface/transformers</Inline> then{" "}
            <Inline>
              npx side-quests-lab depth picture.jpg picture-depth.png
            </Inline>
            . For pictures your visitors upload, pass{" "}
            <Inline>estimateDepth</Inline> from{" "}
            <Inline>side-quests-lab/estimate</Inline> as{" "}
            <Inline>depthMap</Inline> and it's worked out in their browser.
          </p>
        </Step>

        <Step n={3} title="Add it to a page">
          <p className="text-sm text-muted-foreground">
            Put <Inline>{input.pictureName}</Inline> and{" "}
            <Inline>{depthName}</Inline> in your public folder, then:
          </p>
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
          <p className="text-xs text-muted-foreground">
            It fills its container's width and is 16:10 unless you give it a
            height.
          </p>
        </Step>
      </ol>
    </section>
  )
}
