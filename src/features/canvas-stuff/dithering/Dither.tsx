import { ToolIntro } from "@/components/layout/ToolIntro"
import { FileDropZone } from "@/components/upload/FileDropZone"
import { ToolStage } from "@/components/stage/ToolStage"
import { ZoomBox } from "@/components/loupe/ZoomBox"
import { ZoomSelection } from "@/components/loupe/ZoomSelection"
import { Controls } from "./Controls"
import { DitherCanvas } from "./DitherCanvas"
import { StatsPanel } from "./StatsPanel"
import { useDither } from "./useDither"

export function Dither() {
  const {
    settings,
    source,
    stats,
    comparing,
    compareLatched,
    stage,
    region,
    zoomLevel,
    canvasRef,
    loupeRef,
    displayWidth,
    displayHeight,
    onChange,
    pickFile,
    exportPng,
    setCompareLatched,
    startPeek,
    endPeek,
    setRegion,
    setZoomLevel,
  } = useDither()

  return (
    <div className="flex w-full flex-col gap-8">
      <ToolIntro
        title="Dithering"
        hint="Hold the image to see the original. Drop in your own photo to try it on that."
      >
        Old games only had a handful of colours, so they faked the rest with
        dots.
      </ToolIntro>

      <ToolStage
        stage={stage}
        className="grid min-h-[34rem] place-items-center px-6 py-14"
        controls={
          <>
            <Controls
              settings={settings}
              onChange={onChange}
              hasImage={!!source}
              onPickFile={pickFile}
              onExport={exportPng}
              comparing={compareLatched}
              onComparingChange={setCompareLatched}
            />
            <ZoomBox
              loupeRef={loupeRef}
              zoomLevel={zoomLevel}
              onZoomLevelChange={setZoomLevel}
              disabled={!source}
            />
            <StatsPanel stats={stats} />
          </>
        }
      >
        <FileDropZone
          accept="image/*"
          onPick={pickFile}
          empty={!source}
          hint="Drop an image, or click to upload"
          className="grid place-items-center shadow-2xl ring-1 ring-border"
        >
          <DitherCanvas
            ref={canvasRef}
            originalUrl={source?.url ?? null}
            comparing={comparing}
            displayWidth={displayWidth}
            displayHeight={displayHeight}
            onHoldStart={startPeek}
            onHoldEnd={endPeek}
          >
            {source && (
              <ZoomSelection
                region={region}
                width={displayWidth}
                height={displayHeight}
                onChange={setRegion}
              />
            )}
          </DitherCanvas>
        </FileDropZone>
      </ToolStage>
    </div>
  )
}
