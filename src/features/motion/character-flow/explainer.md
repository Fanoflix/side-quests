# Changing one word into another is mostly about deciding which letters stay.

Say the word goes from **delayed** to **boarding**. Before anything moves, the code has to answer one question: which letters are the same letter?

## 1. Find the letters both words share

It looks for the longest run of letters that shows up in both words, in the same order. Those letters are kept. They don't disappear and come back. They just slide over to their new spot.

If a single letter would have to travel across the whole word to line up, it's ignored. A lone **e** zooming from one end to the other looks like a mistake, not a match.

## 2. Pair up the rest

Whatever is left over gets paired off, one old letter with one new letter, in the same place. If the new word is longer, the extra letters roll in from below. If it's shorter, the leftovers roll up and fade away.

Numbers pair up from the right, the way a price does. So **$980** turning into **$1,024** grows on the left, like a real counter.

## 3. Spin each pair like a slot machine

A changed letter doesn't just swap. It spins through the alphabet from the old letter to the new one, inside its own little window that fades out at the top and bottom.

- **a** to **d** passes through **b** and **c**.
- Far-apart letters skip some steps, so it never spins through more than 8 in between.
- A letter that has further to go spins faster, because it has the same amount of time to get there.

That last part is the feel [NumberFlow](https://number-flow.barvian.me/) has for numbers. This does it for letters.

## Why it stays smooth

Everything is measured once before the change and once after. Then the browser does the moving on its own, using only position and fade. Nothing is recalculated while it animates, so it holds 60 frames a second even when you click quickly.

[The full version, with the matching algorithm](https://github.com/Fanoflix/webfun/blob/main/src/features/motion/character-flow/how-it-works.md)
