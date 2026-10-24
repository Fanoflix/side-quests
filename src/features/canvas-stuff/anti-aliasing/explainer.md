# Smooth edges come from asking each pixel the same question more than once.

Your screen is a grid of tiny squares. Each square can only be one colour. But the edge of a circle doesn't care about your grid. It cuts right through the middle of some squares.

## 1. Why edges go jagged

The simple way to draw a shape is to check one point in the middle of each square and ask: is this inside the shape? Yes means shape colour, no means background.

Along a curve, those yes and no answers line up into steps. That's the staircase, and it's called **aliasing**.

## 2. Ask more than once

Anti-aliasing checks several points inside each square instead of one. With **Samples** at 4, it checks a 4 by 4 grid, so 16 points per square.

If 6 of those 16 points are inside the shape, the square is 6/16 of the way between the background and the shape colour. Edge squares become in-between shades, and your eye reads them as a smooth line.

## 3. The catch

Checking 16 points costs 16 times the work. That's why games give you a setting for it. Higher looks smoother and runs slower.

## Try this

Set **Samples** to 1 and look at the zoom box. Then drag it up one step at a time and watch the steps soften into a gradient.

[The full version, with the maths](https://github.com/Fanoflix/webfun/blob/main/src/features/canvas-stuff/anti-aliasing/how-it-works.md)
