# Your brain fills in missing pixels far better than you'd expect.

A stadium scoreboard is just a grid of coloured lights. Up close, it's dots. From the seats, it's a face. This tool does the same to any video, in two steps.

## 1. Shrink it to a tiny grid

Every frame gets squashed down to the grid size you pick, 64 by 36 to start. To fit, the browser averages each patch of the video into one colour. A 1920-wide video into 64 columns means each dot is the average of a 30 by 30 patch.

Nothing is picked or skipped. Every pixel of the original counts towards some dot.

## 2. Blow it back up as dots

Each of those colours is drawn as a single round dot, with dark space around it. The gaps are what make it look like a screen made of lights instead of a blurry video.

Every dot is drawn the exact same whole number of pixels wide. If they were 12.7 pixels wide, some would land between pixels and the whole grid would shimmer.

## Try this

Lower **Columns** until you can't tell what the shape is anymore. Most people can still read it with far fewer dots than they'd guess.

[The full version, with the maths](https://github.com/Fanoflix/webfun/blob/main/src/features/canvas-stuff/low-res-video/how-it-works.md)
