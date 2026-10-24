import { Plus, RotateCcw, Shuffle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IntroLink, ToolIntro } from "@/components/layout/ToolIntro"
import { Panel } from "@/components/stage/Panel"
import { Range } from "@/components/stage/Range"
import { ToolStage } from "@/components/stage/ToolStage"
import { cn } from "@/lib/utils"
import { CharacterFlow } from "./CharacterFlow"
import { PackageTeaser } from "./PackageTeaser"
import { MODES, TRENDS, useCharacterFlowDemo } from "./useCharacterFlowDemo"
import { WordWheel } from "./WordWheel"

const seconds = (value: number) => `${value.toFixed(2)}s`

export function CharacterFlowDemo() {
  const {
    stage,
    timing,
    updateTiming,
    resetTiming,
    isDefaultTiming,
    eases,
    value,
    setValue,
    mode,
    selectMode,
    words,
    wordIndex,
    advance,
    onPreviewKey,
    selectWord,
    draft,
    setDraft,
    addWord,
    removeWord,
    ease,
    isSentence,
    fontSize,
  } = useCharacterFlowDemo()

  return (
    <div className="flex w-full flex-col gap-8">
      <ToolIntro
        title="Character Flow"
        hint="Click the text to change it, or type your own. Every timing setting is in the panel on the right."
      >
        <IntroLink href="https://number-flow.barvian.me/">NumberFlow</IntroLink>
        , but for words.
      </ToolIntro>

      <ToolStage
        stage={stage}
        className="flex min-h-[32rem] flex-col items-center justify-center gap-12 px-6 py-20"
        controls={
          <>
            {mode === "words" && (
              <Panel title="Words">
                <div className="h-48">
                  <WordWheel
                    words={words}
                    index={wordIndex}
                    onSelect={selectWord}
                    onRemove={removeWord}
                  />
                </div>
                <form
                  className="flex gap-1.5"
                  onSubmit={(e) => {
                    e.preventDefault()
                    addWord()
                  }}
                >
                  <Input
                    variant="filled"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Add a word…"
                    aria-label="Add a word to the list"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!draft.trim()}
                    aria-label="Add word"
                  >
                    <Plus />
                  </Button>
                </form>
              </Panel>
            )}

            <Panel
              title="Timing"
              action={
                <button
                  type="button"
                  onClick={resetTiming}
                  disabled={isDefaultTiming}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                >
                  <RotateCcw className="size-3" />
                  NumberFlow defaults
                </button>
              }
            >
              <Range
                label="Spin"
                value={timing.duration}
                min={0.1}
                max={2}
                step={0.05}
                format={seconds}
                onChange={(duration) => updateTiming({ duration })}
              />
              <Range
                label="Slide"
                value={timing.slideDuration}
                min={0.1}
                max={2}
                step={0.05}
                format={seconds}
                onChange={(slideDuration) => updateTiming({ slideDuration })}
              />
              <Range
                label="Fade"
                value={timing.fadeDuration}
                min={0.05}
                max={1.5}
                step={0.05}
                format={seconds}
                onChange={(fadeDuration) => updateTiming({ fadeDuration })}
              />
              <Range
                label="Stagger"
                value={timing.stagger}
                min={0}
                max={0.1}
                step={0.005}
                format={seconds}
                onChange={(stagger) => updateTiming({ stagger })}
              />
              <div className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs text-muted-foreground">
                  Easing
                </span>
                <Select
                  value={timing.easeKey}
                  onValueChange={(v) =>
                    v !== null && updateTiming({ easeKey: v })
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className="flex-1"
                    aria-label="Easing"
                  >
                    <SelectValue>
                      {(v) =>
                        eases.find((e) => e.key === v)?.label ?? String(v)
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {eases.map(({ key, label }) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Panel>

            <Panel title="Rolling">
              <Range
                label="Max steps"
                value={timing.maxSteps}
                min={0}
                max={25}
                onChange={(maxSteps) => updateTiming({ maxSteps })}
              />
              <div className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs text-muted-foreground">
                  Direction
                </span>
                <div className="flex flex-1 gap-1">
                  {TRENDS.map(({ value: trend, label }) => (
                    <Button
                      key={trend}
                      size="sm"
                      className="flex-1"
                      variant={timing.trend === trend ? "default" : "outline"}
                      aria-pressed={timing.trend === trend}
                      onClick={() => updateTiming({ trend })}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </Panel>
          </>
        }
      >
        <div
          role="button"
          tabIndex={0}
          onClick={advance}
          onKeyDown={onPreviewKey}
          aria-label="Show the next example"
          className="[container-type:inline-size] grid w-full cursor-pointer place-items-center select-none focus-visible:outline-none"
        >
          <CharacterFlow
            value={value}
            ease={ease}
            duration={timing.duration}
            slideDuration={timing.slideDuration}
            fadeDuration={timing.fadeDuration}
            stagger={timing.stagger}
            maxSteps={timing.maxSteps}
            trend={timing.trend}
            className={cn(
              "tracking-tight",
              isSentence ? "font-normal" : "font-semibold"
            )}
            style={{ fontSize }}
          />
        </div>

        <div className="flex w-full max-w-md flex-col items-center gap-5">
          <div
            role="group"
            aria-label="Example set"
            className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm"
          >
            {MODES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                aria-pressed={mode === key}
                onClick={() => selectMode(key)}
                className={cn(
                  "relative py-1 transition-colors duration-175 ease-snap",
                  mode === key
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
                <span
                  className={cn(
                    "absolute inset-x-0 -bottom-px h-px bg-foreground transition-[scale] duration-175 ease-snap",
                    mode === key ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </button>
            ))}
          </div>
          <div className="flex w-full gap-2">
            <Button onClick={advance} className="shrink-0">
              <Shuffle />
              Next
            </Button>
            <Input
              variant="filled"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type your own…"
              aria-label="Text to animate"
            />
          </div>
        </div>
      </ToolStage>

      <PackageTeaser />
    </div>
  )
}
