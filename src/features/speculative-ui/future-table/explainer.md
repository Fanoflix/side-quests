# Keep the rows where they are and only change the words inside them.

In most tables, when the data changes, the rows get thrown away and new ones are built. Everything jumps, and you have to find your place again.

This table works like a departures board at a train station.

## 1. The rows are fixed

There are always 10 rows. Row 3 is always the fourth line on screen, whether there's data for it or not. Empty rows show a placeholder instead of disappearing.

## 2. Data gets poured into them

Page 1 puts flights 1 to 10 into the 10 rows. Page 2 puts flights 11 to 20 into the same 10 rows. Nothing moves. The rows stay put and only what's written in them changes.

## 3. Only the cells that changed flip

The table remembers what every cell showed last time. When a new update comes in, it compares. Cells that are the same stay still. Cells that changed flip over to their new value, letter by letter, using Character Flow.

That's why a status can change from **Boarding** to **Delayed** while the rest of the board sits perfectly still.

## Is this better?

Maybe, maybe not. It's an idea. Click through the pages and see if you find it easier to keep track of where you are.

[The full version, with the code](https://github.com/Fanoflix/webfun/blob/main/src/features/speculative-ui/future-table/how-it-works.md)
