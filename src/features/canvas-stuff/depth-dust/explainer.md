# A flat picture already knows which parts are close to you.

Look at any photo and you can tell a face is in front of the wall behind it. Nobody told you. You just know. A small AI model can guess that too, for every pixel.

That guess is called a depth map: a grey copy of the picture where white means close and black means far.

## 1. Turn the picture into dust

The picture is cut into a grid of 524,288 tiny points, about one for every pixel. Each point takes the colour of the spot it came from.

Then every point gets pushed towards you by how white its spot is on the depth map. The nose and brow come forward. The background stays back. Drag the picture to turn it and suddenly a flat picture has a front and a back.

## 2. Make it breathe

A flat sheet of points sitting still looks like a screenshot, so everything moves a little:

- The camera sways slowly from side to side, so you can see the depth. The picture itself holds still.
- Past the **drift line**, the picture gives off dust that blows away the way the line's tick points. Drag its ends to turn it, or the line itself to move it.
- **Reach** is how far the dust travels, **Spread** how much each speck strays from the line's direction, and **Softness** how gradually the drift starts.
- A few points break loose and float around it. That's **Splash**.

The dust can be a fine mist (**Subtle**), specks (**Dots**), hairline trails (**Streaks**) or bright heads with tails (**Comets**).

## 3. Light and dark

In the dark theme, each point is a tiny light, and where lots of them pile up the picture glows. In the light theme, each point is a fleck of the picture's real colour laid on the page, so it looks like the picture, printed in dust.

## Try this

Pick **Streaks**, push **Drift** past 100 and **Drift speed** up, then drag the picture to look at the trails side on. Then drop in a photo of your own. The first one takes a moment while the depth model downloads.

[The full version, with the maths](https://github.com/Fanoflix/side-quests/blob/main/src/features/canvas-stuff/depth-dust/how-it-works.md)
