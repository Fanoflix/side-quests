import type { ReactNode } from "react"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/package/CodeBlock"
import { InstallCommand } from "@/components/package/InstallCommand"
import { NpmLink } from "@/components/package/NpmLink"
import { depthFileName } from "./snippet"
import { useInstallCard } from "./useInstallCard"
import type { SnippetInput } from "./snippet"

type Props = SnippetInput & {
  hasPicture: boolean
  onDownloadDepth: () => void
}

const CLI_DEPTH = `npm i -D @huggingface/transformers
npx side-quests-lab depth picture.jpg picture-depth.png`

const BROWSER_DEPTH = `import { estimateDepth } from "side-quests-lab/estimate"

<DepthDust src={uploadedUrl} depthMap={estimateDepth} />`

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
  const { install, snippet } = useInstallCard(input)
  const depthName = depthFileName(input.pictureName)

  return (
    <section className="flex flex-col gap-5 border-y border-border py-5">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-base font-medium">Put it on your own site</h2>
          <NpmLink className="ml-auto" />
        </div>
        <p className="text-sm text-muted-foreground">
          It's a React component. Tune it here, then follow these three steps.
          The snippet follows the controls, so it's always what you see.
        </p>
      </div>

      <ol className="flex flex-col gap-5">
        <Step n={1} title="Install it">
          <InstallCommand command={install} />
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
          <div className="flex flex-col gap-2 pt-2">
            <p className="text-xs text-muted-foreground">
              <span className="mr-1.5 border border-border px-1.5 py-px text-[11px]">
                Optional
              </span>
              Make depth maps from the command line instead:
            </p>
            <CodeBlock code={CLI_DEPTH} />
            <p className="pt-1 text-xs text-muted-foreground">
              <span className="mr-1.5 border border-border px-1.5 py-px text-[11px]">
                Optional
              </span>
              Or, for pictures your visitors upload, work it out in their
              browser:
            </p>
            <CodeBlock code={BROWSER_DEPTH} />
          </div>
        </Step>

        <Step n={3} title="Add it to a page">
          <p className="text-sm text-muted-foreground">
            Put <Inline>{input.pictureName}</Inline> and{" "}
            <Inline>{depthName}</Inline> in your public folder, then:
          </p>
          <CodeBlock code={snippet} />
          <p className="text-xs text-muted-foreground">
            It fills its container's width and is 16:10 unless you give it a
            height.
          </p>
        </Step>
      </ol>
    </section>
  )
}
