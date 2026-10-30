import { IntroLink, ToolIntro } from "@/components/layout/ToolIntro"
import { ToolStage } from "@/components/stage/ToolStage"
import { FileDropZone } from "@/components/upload/FileDropZone"
import { cn } from "@/lib/utils"
import { Controls } from "./Controls"
import { InstallCard } from "./InstallCard"
import { useDepthDust } from "./useDepthDust"

export function DepthDust() {
  const {
    settings,
    comparing,
    setComparing,
    pictureUrl,
    pictureName,
    downloadDepth,
    flatSize,
    angle,
    status,
    stage,
    stageHeight,
    canvasRef,
    hasPicture,
    aspect,
    busy,
    light,
    panEnabled,
    panSpeed,
    driftSpeed,
    dragging,
    onChange,
    pickFile,
    replay,
    showGuide,
    togglePan,
    setPanSpeed,
    setDriftSpeed,
    onPointerDown,
    onPointerMove,
    endDrag,
  } = useDepthDust()

  return (
    <div className="flex w-full flex-col gap-8">
      <ToolIntro
        title="Depth Dust"
        hint={
          <>
            Drag it to look around, or drop in your own picture. Inspired by{" "}
            <IntroLink href="https://gather.be-of-dao.com">Gather</IntroLink> by
            DAO.
          </>
        }
      >
        Turn any image into a stylized 3D image.
      </ToolIntro>

      <ToolStage
        stage={stage}
        controls={
          <Controls
            settings={settings}
            status={status}
            busy={busy}
            hasPicture={hasPicture}
            aspect={aspect}
            panEnabled={panEnabled}
            panSpeed={panSpeed}
            driftSpeed={driftSpeed}
            onChange={onChange}
            onPickFile={pickFile}
            onReplay={replay}
            onPanChange={togglePan}
            onPanSpeedChange={setPanSpeed}
            onDriftSpeedChange={setDriftSpeed}
            onLineDragChange={showGuide}
            comparing={comparing}
            onComparingChange={setComparing}
          />
        }
      >
        <FileDropZone
          accept="image/*"
          onPick={pickFile}
          empty={false}
          hint="Drop a picture"
        >
          <canvas
            ref={canvasRef}
            aria-label="The picture, drawn as a cloud of moving points"
            role="img"
            style={{ height: stageHeight }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className={cn(
              "block w-full",
              panEnabled && "touch-none",
              panEnabled && (dragging ? "cursor-grabbing" : "cursor-grab")
            )}
          />
          {comparing && (
            <img
              src={pictureUrl}
              alt="The original picture"
              style={{ width: flatSize.width, height: flatSize.height }}
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          )}
        </FileDropZone>
      </ToolStage>

      <InstallCard
        {...settings}
        driftSpeed={driftSpeed}
        light={light}
        pan={panEnabled}
        panSpeed={panSpeed}
        angle={angle}
        pictureName={pictureName}
        hasPicture={hasPicture}
        onDownloadDepth={downloadDepth}
      />
    </div>
  )
}
