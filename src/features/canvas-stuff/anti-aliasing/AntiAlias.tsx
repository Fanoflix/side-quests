import { ToolIntro } from "@/components/layout/ToolIntro"
import { ToolStage } from "@/components/stage/ToolStage"
import { ZoomBox } from "@/components/loupe/ZoomBox"
import { ZoomSelection } from "@/components/loupe/ZoomSelection"
import { AACanvas } from "./AACanvas"
import { Controls } from "./Controls"
import { useAntiAlias } from "./useAntiAlias"

export function AntiAlias() {
  const {
    settings,
    comparing,
    compareLatched,
    stage,
    animating,
    region,
    zoomLevel,
    canvasRef,
    loupeRef,
    displayWidth,
    displayHeight,
    onChange,
    exportPng,
    setCompareLatched,
    startPeek,
    endPeek,
    setAnimating,
    setRegion,
    setZoomLevel,
  } = useAntiAlias()

  return (
    <div className="flex w-full flex-col gap-8">
      <ToolIntro
        title="Anti-aliasing"
        hint="Drag Samples up to smooth the edge out. Hold the image to see it without."
      >
        Pixels are square, so every curve on your screen is really a staircase.
      </ToolIntro>

      <ToolStage
        stage={stage}
        className="grid min-h-[34rem] place-items-center px-6 py-14"
        controls={
          <>
            <Controls
              settings={settings}
              onChange={onChange}
              animating={animating}
              onToggleAnimate={setAnimating}
              onExport={exportPng}
              comparing={compareLatched}
              onComparingChange={setCompareLatched}
            />
            <ZoomBox
              loupeRef={loupeRef}
              zoomLevel={zoomLevel}
              onZoomLevelChange={setZoomLevel}
            />
          </>
        }
      >
        <div className="relative grid place-items-center shadow-2xl ring-1 ring-border">
          <AACanvas
            ref={canvasRef}
            comparing={comparing}
            displayWidth={displayWidth}
            displayHeight={displayHeight}
            onHoldStart={startPeek}
            onHoldEnd={endPeek}
          >
            <ZoomSelection
              region={region}
              width={displayWidth}
              height={displayHeight}
              onChange={setRegion}
            />
          </AACanvas>
        </div>
      </ToolStage>
    </div>
  )
}
