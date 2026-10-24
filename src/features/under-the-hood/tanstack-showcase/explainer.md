# Each version hands one more chore to a library, and the network panel shows it.

It's the same little ticket app every time. The only thing that changes is how it gets its data.

## 1. Plain React

The app asks the server every single time it needs something. Open ticket 3, it fetches. Close it and open it again, it fetches again, with a spinner again.

After every change you make, you also have to remember to refetch everything that shows that ticket. Forget one and the screen is out of date.

## 2. TanStack Query

Now answers get saved, filed under a name like "ticket 3". Open ticket 3 a second time and it shows up instantly from the saved copy. If the copy is older than 30 seconds, it quietly checks for a newer one in the background.

After a change, you tell it "anything about tickets is old now", and it refreshes what's on screen.

## 3. TanStack DB

Now the tickets live in a small database inside the page. The list, the filters and the detail view are all questions asked of that database, and they update themselves the moment a ticket changes.

Your edits show up instantly, before the server answers. If the server says no, they get undone for you.

## What to look at

Watch the network panel on the right as you switch versions. The app looks the same each time. The number of requests and the code you'd have to write by hand both go down.

[The full version, with the real numbers](https://github.com/Fanoflix/side-quests/blob/main/src/features/under-the-hood/tanstack-showcase/how-it-works.md)
