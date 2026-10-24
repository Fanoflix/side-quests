# Your eyes blend tiny dots into shades that aren't really there.

Imagine you only have black and white paint, and you need to paint grey. You can't mix them. But if you paint lots of tiny black and white dots next to each other, from far away it looks grey.

That's dithering.

## 1. The bad way: round every pixel

Take every pixel and snap it to the closest colour you're allowed. Light grey becomes white and dark grey becomes black. A smooth sky turns into a few flat stripes. All the in-between shades are gone.

## 2. The good way: keep track of the mistake

When a pixel gets rounded, it's a little wrong. Maybe it should have been 40% bright and it became 0%. Instead of forgetting that, the code passes the leftover 40% on to the pixels next to it.

Those neighbours are now a bit brighter than they were, so some of them round up to white. Over a small patch, the average brightness comes out right, even though every single pixel is black or white.

The default setting, **Floyd–Steinberg**, splits the leftover between 4 neighbours: most of it goes to the pixel on the right, and the rest to the row below.

## 3. Or use a pattern instead

The **Bayer** settings skip the bookkeeping. They lay a fixed grid of thresholds over the image, so some pixels round up a bit more easily than others. That's where the neat crosshatch texture comes from. It's what a lot of old handheld games looked like.

## Try this

Drop **Levels** to 2 and hold the image. That's a photo made of only two colours. Your eyes do the rest.

[The full version, with the maths](https://github.com/Fanoflix/side-quests/blob/main/src/features/canvas-stuff/dithering/how-it-works.md)
