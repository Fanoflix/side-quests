import { useRef } from "react"
import { Eye, ImagePlus, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Panel } from "@/components/stage/Panel"
import { Range } from "@/components/stage/Range"
import { LinePad } from "./LinePad"
import { PARTICLES } from "./field"
import type { DustSettings } from "./field"
import { MAX_PAN_SPEED, MIN_PAN_SPEED } from "./usePan"
import {
  MAX_DRIFT_SPEED,
  MAX_REACH,
  MIN_DRIFT_SPEED,
  MIN_REACH,
} from "./useDepthDust"
import type { DustStatus } from "./useDepthDust"

type Props = {
  settings: DustSettings
  status: DustStatus
  busy: boolean
  hasPicture: boolean
  aspect: number
  panEnabled: boolean
  panSpeed: number
  driftSpeed: number
  onChange: (patch: Partial<DustSettings>) => void
  onPickFile: (file: File) => void
  onReplay: () => void
  onPanChange: (on: boolean) => void
  onPanSpeedChange: (speed: number) => void
  onDriftSpeedChange: (speed: number) => void
  onLineDragChange: (active: boolean) => void
  comparing: boolean
  onComparingChange: (comparing: boolean) => void
}

const percent = (value: number) => `${Math.round(value * 100)}`

function statusLine(status: DustStatus) {
  switch (status.kind) {
    case "downloading":
      return `Fetching the depth model, ${percent(status.progress)}%. Only the first time.`
    case "reading":
      return "Working out how far away everything is…"
    case "error":
      return "That one didn't work. Try another picture."
    case "unsupported":
      return "This browser can't draw it: it needs WebGL2."
    case "idle":
      return null
  }
}

export function Controls({
  settings,
  status,
  busy,
  hasPicture,
  aspect,
  panEnabled,
  panSpeed,
  driftSpeed,
  onChange,
  onPickFile,
  onReplay,
  onPanChange,
  onPanSpeedChange,
  onDriftSpeedChange,
  onLineDragChange,
  comparing,
  onComparingChange,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const message = statusLine(status)

  return (
    <>
      <Panel title="Picture">
        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus />
            Use your own
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={!hasPicture}
            onClick={onReplay}
            aria-label="Play the gather-in again"
          >
            <RotateCcw />
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onPickFile(file)
              e.target.value = ""
            }}
          />
        </div>
        {/* A latch, not a hold: pressing on the picture already means "pan",
            and a latch lets you keep the original up while you move a
            slider. */}
        <Toggle
          variant="outline"
          disabled={!hasPicture}
          pressed={comparing}
          onPressedChange={onComparingChange}
          className="w-full"
        >
          <Eye />
          {comparing ? "Showing the flat picture" : "Compare"}
        </Toggle>
        {message && (
          <p aria-live="polite" className="text-xs text-muted-foreground">
            {message}
          </p>
        )}
      </Panel>

      <Panel title="Dust">
        <Range
          label="Drift"
          value={settings.drift}
          min={0}
          max={2}
          step={0.01}
          format={percent}
          onChange={(drift) => onChange({ drift })}
        />
        <Range
          label="Splash"
          value={settings.splash}
          min={0}
          max={1}
          step={0.01}
          format={percent}
          onChange={(splash) => onChange({ splash })}
        />
        <Range
          label="Cohesion"
          value={settings.cohesion}
          min={0}
          max={1}
          step={0.01}
          format={percent}
          onChange={(cohesion) => onChange({ cohesion })}
        />
        <Range
          label="Depth"
          value={settings.depth}
          min={0}
          max={1}
          step={0.01}
          format={percent}
          onChange={(depth) => onChange({ depth })}
        />
        <label className="flex cursor-pointer items-center justify-between gap-2 select-none">
          <span className="text-xs text-muted-foreground">Drag to pan</span>
          <input
            type="checkbox"
            checked={panEnabled}
            onChange={(e) => onPanChange(e.target.checked)}
            className="size-4 accent-primary"
          />
        </label>
        <Range
          label="Pan speed"
          value={panSpeed}
          min={MIN_PAN_SPEED}
          max={MAX_PAN_SPEED}
          step={0.05}
          unit="×"
          format={(v) => v.toFixed(2)}
          onChange={onPanSpeedChange}
          disabled={!panEnabled}
        />
      </Panel>

      <Panel title="Drift line">
        <LinePad
          line={settings.line}
          aspect={aspect}
          onChange={(line) => onChange({ line })}
          onDragChange={onLineDragChange}
        />
        <Range
          label="Drift speed"
          value={driftSpeed}
          min={MIN_DRIFT_SPEED}
          max={MAX_DRIFT_SPEED}
          step={0.05}
          unit="×"
          format={(v) => v.toFixed(2)}
          onChange={onDriftSpeedChange}
        />
        <Range
          label="Reach"
          value={settings.reach}
          min={MIN_REACH}
          max={MAX_REACH}
          step={0.05}
          unit="×"
          format={(v) => v.toFixed(2)}
          onChange={(reach) => onChange({ reach })}
        />
        <Range
          label="Spread"
          value={settings.spread}
          min={0}
          max={1}
          step={0.01}
          format={percent}
          onChange={(spread) => onChange({ spread })}
        />
        <Range
          label="Softness"
          value={settings.softness}
          min={0}
          max={1}
          step={0.01}
          format={percent}
          onChange={(softness) => onChange({ softness })}
        />
        <ToggleGroup
          aria-label="Drifting particles"
          variant="outline"
          size="sm"
          spacing={0}
          value={[settings.particles]}
          onValueChange={(value) => {
            const next = PARTICLES.find((p) => p === value[0])
            if (next) onChange({ particles: next })
          }}
          className="w-full"
        >
          {PARTICLES.map((particles) => (
            <ToggleGroupItem
              key={particles}
              value={particles}
              className="flex-1 capitalize"
            >
              {particles}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-xs text-muted-foreground">
          Past the line, the picture blows away the way the tick points. Drag an
          end to turn it, the line to move it, the tick to flip it.
        </p>
      </Panel>
    </>
  )
}
