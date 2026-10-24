# One font, four dials, and one rule that stops it looking twitchy.

The text never changes. What changes is how each letter is drawn, and each letter does its own thing.

## 1. One font that can bend

The page uses **variable fonts**. A normal font file has one weight. A variable font has a dial, so it can be any weight from thin to heavy and anything in between. The one used here also has a dial for slant.

Because they're dials, letters glide between styles instead of snapping.

## 2. Four things a letter can change

- **Weight:** thin to bold.
- **Italic:** upright to slanted.
- **Serif:** plain to the fancy font with the little feet.
- **Size:** a touch bigger or smaller.

## 3. One rule that keeps it calm

On each step, a letter changes exactly one of those four things. And it's not allowed to change the same thing twice in a row.

Without that rule, a letter might go bold, bolder, boldest, and it looks twitchy. With it, a weight change has to be followed by something else, so the motion keeps moving around and reads as a shimmer.

## 4. It always settles down

The shimmer runs for a set time and then every letter eases back to normal. The demo just starts it again so you can keep watching.

[The full version, with the rules in code](https://github.com/Fanoflix/webfun/blob/main/src/features/motion/style-flow/how-it-works.md)
