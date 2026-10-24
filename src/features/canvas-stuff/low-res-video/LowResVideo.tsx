import { ToolIntro } from "@/components/layout/ToolIntro"
import { ToolStage } from "@/components/stage/ToolStage"
import { FileDropZone } from "@/components/upload/FileDropZone"
import { Controls } from "./Controls"
import { PixelScreen } from "./PixelScreen"
import { VideoTransport } from "./VideoTransport"
import { useLowResVideo } from "./useLowResVideo"

export function LowResVideo() {
  const {
    stage,
    settings,
    shape,
    hasVideo,
    playing,
    muted,
    volume,
    lockAspect,
    currentTime,
    duration,
    videoAspect,
    videoRef,
    screenRef,
    onChange,
    setShape,
    toggleLockAspect,
    pickFile,
    seek,
    togglePlay,
    toggleMute,
    setVolume,
  } = useLowResVideo()

  return (
    <div className="flex w-full flex-col gap-8">
      <ToolIntro
        title="Low Res Video"
        hint="Shrink the grid until it stops looking like anything. Drop in your own video to try it on that."
      >
        How few dots does a video need before you can't tell what it is?
      </ToolIntro>

      {/* The transport rides *inside* the screen container rather than sitting
          under it: the screen is resizable, and a sibling bar either forced a
          fixed width on the whole thing or overflowed once the screen grew past
          it. As an overlay it simply tracks whatever size the screen is. */}
      <ToolStage
        stage={stage}
        className="grid min-h-[34rem] place-items-center px-6 py-14"
        controls={
          <Controls
            settings={settings}
            onChange={onChange}
            hasVideo={hasVideo}
            lockAspect={lockAspect}
            onToggleLockAspect={toggleLockAspect}
            shape={shape}
            onShapeChange={setShape}
            onPickFile={pickFile}
          />
        }
      >
        <FileDropZone
          accept="video/*"
          onPick={pickFile}
          empty={!hasVideo}
          hint="Drop a video, or click to upload"
          className="group grid w-full place-items-center overflow-auto"
        >
          <PixelScreen
            ref={screenRef}
            width={settings.width}
            height={settings.height}
            gap={settings.gap}
            dotSize={settings.dotSize}
            shape={shape}
            aspect={videoAspect}
          />

          {hasVideo && (
            <VideoTransport
              playing={playing}
              onTogglePlay={togglePlay}
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
              muted={muted}
              onToggleMute={toggleMute}
              volume={volume}
              onVolumeChange={setVolume}
            />
          )}
        </FileDropZone>
      </ToolStage>

      <video ref={videoRef} className="hidden" playsInline loop muted />
    </div>
  )
}
