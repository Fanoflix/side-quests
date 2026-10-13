import { useCallback } from "react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { Server } from "../../engine/server"

import type { EventBus } from "../../engine/events"
import type { Ticket, TicketStatus } from "../../engine/types"
import type { LoadState, TicketsView } from "../contract"
import type { TicketCollection } from "./collection"
import { TICKETS_KEY } from "./collection"
import { useLiveQueryInstrumentation } from "./useLiveQueryInstrumentation"
import {
  IDLE_DETAIL_KEY,
  STALE_TIME,
  ticketKeys,
  traceOf,
} from "../rung1-query/keys"

const TRACE = JSON.stringify(TICKETS_KEY)

/**
 * Ids for rows that exist only optimistically, until the server assigns a real
 * one.
 *
 * Monotonically decreasing starting at `Number.MAX_SAFE_INTEGER`, so an
 * optimistic row sorts above every realistic server id under the live
 * query's `id DESC` ordering — the row stays at the top of the inbox from
 * the moment it is filed through to when the server replaces its id with a
 * real one. Still deterministic and still collision-free with any id the
 * server will ever assign.
 */
let nextTempId = Number.MAX_SAFE_INTEGER
const tempId = () => nextTempId--

/**
 * Rung 2 — the same app again, with a TanStack DB collection over rung 1's Query.
 *
 * What changes here is the *write* path, and it's the thing Query alone can't
 * do without you writing it out by hand.
 *
 * Writes are optimistic by default. `collection.update(...)` changes the row
 * locally, every live query watching it updates in the same tick, and the
 * server is told afterwards. If the server refuses, DB puts the row back on its
 * own — no snapshot to take, no `onMutate`/`onError` pair to keep in sync, no
 * list of caches to repair.
 *
 * The read path is more modest than it looks, and worth being straight about:
 * the *list* is local and live, so the detail pane's header paints from a row
 * that's already here. But the body still costs a request, because the endpoint
 * feeding the collection only sends summaries. A collection knows what it has
 * been given and no more.
 */
export function useDbTickets({
  collection,
  server,
  bus,
  selectedId,
}: {
  collection: TicketCollection
  server: Server
  bus: EventBus
  selectedId: number | null
}): TicketsView {
  const queryClient = useQueryClient()

  // A live query, not a fetch: it recomputes locally whenever the rows beneath
  // it change, including from an optimistic write that hasn't reached the
  // server yet.
  //
  // The explicit `orderBy` is what keeps a just-created ticket from jumping
  // down the list after the server round-trip. Collection reconciliation
  // appends new synced rows to the Map, which otherwise shows the row at the
  // top (optimistic) and then the bottom (synced). An `id desc` sort pins both
  // positions to the top — temp ids are seeded high (see `tempId()`) and real
  // ids monotonically increase, so each newly filed row stays newest.
  const list = useLiveQuery((q) =>
    q.from({ ticket: collection }).orderBy(({ ticket }) => ticket.id, "desc")
  )

  // The selected row, read locally. It carries the header — title, status,
  // assignee — which is why the detail pane has something to draw the moment
  // you click, and why an optimistic status change shows up there in the same
  // tick as in the list.
  const selected = useLiveQuery(
    (q) =>
      selectedId === null
        ? undefined
        : q
            .from({ ticket: collection })
            .where(({ ticket }) => eq(ticket.id, selectedId)),
    [selectedId]
  )

  // DB reports its own live-query activity, the same way Query reports its
  // cache. Without this the timeline shows an empty panel for a selection at
  // this rung, which reads as "nothing was recorded" rather than "this cost
  // nothing" — and a live query really did run.
  useLiveQueryInstrumentation(selected.collection, bus, TRACE)

  // The body and comments, which the collection was never sent. Rung 1's Query
  // client is still underneath — the collection is built on it — so this is the
  // same cache, keyed the same way, and a ticket opened twice is still fetched
  // once.
  const detailQuery = useQuery({
    queryKey:
      selectedId === null ? IDLE_DETAIL_KEY : ticketKeys.detail(selectedId),
    queryFn: ({ signal }) =>
      server.getTicket(
        selectedId!,
        traceOf(ticketKeys.detail(selectedId!)),
        signal
      ),
    enabled: selectedId !== null,
    staleTime: STALE_TIME,
  })

  const listState: LoadState = list.isReady ? "ready" : "loading"
  const detailState: LoadState =
    selectedId === null
      ? "idle"
      : detailQuery.isError
        ? "error"
        : detailQuery.data
          ? "ready"
          : "loading"

  /**
   * Every write is the same shape: change the row, let DB show it immediately,
   * and let it undo the change itself if the server says no. The `catch` is
   * only here to stop an expected rejection surfacing as an unhandled promise —
   * the rollback has already happened by then.
   */
  const write = useCallback(
    (
      label: string,
      apply: () => { isPersisted: { promise: Promise<unknown> } }
    ) => {
      bus.emit("db:optimistic:apply", label, TRACE)
      const tx = apply()
      tx.isPersisted.promise.catch(() => {})
    },
    [bus]
  )

  const create = useCallback(
    (title: string, assignee: string) => {
      bus.emit("ui:interaction", "create ticket")
      write(`insert "${title}"`, () =>
        collection.insert({
          // The server assigns the real id; this one only has to be unique
          // locally for the moment the row is optimistic.
          id: tempId(),
          title,
          assignee,
          status: "open",
          // The server cuts the real excerpt from the body it stores; this is
          // the optimistic stand-in until its summary comes back.
          preview: "Filed from the composer.",
        })
      )
    },
    [bus, collection, write]
  )

  const setStatus = useCallback(
    (id: number, status: TicketStatus) => {
      bus.emit("ui:interaction", `status → ${status}`)
      write(`update #${id}`, () =>
        collection.update(id, (draft) => {
          draft.status = status
        })
      )
    },
    [bus, collection, write]
  )

  const rename = useCallback(
    (id: number, title: string) => {
      bus.emit("ui:interaction", `rename #${id}`)
      write(`update #${id}`, () =>
        collection.update(id, (draft) => {
          draft.title = title
        })
      )
    },
    [bus, collection, write]
  )

  /**
   * Body edits don't go through the collection — the row doesn't carry a body,
   * only a preview the server cuts. So this write is a plain Query mutation
   * over the detail cache, with the collection poked afterwards so the new
   * preview catches up in the inbox row.
   *
   * The optimistic update is on the detail cache: the paragraphs change in the
   * same tick as the keystroke that committed them, and if the server refuses
   * `onError` rolls the cache back to the snapshot it took on `onMutate`.
   */
  const bodyMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: string[] }) =>
      server.setBody(id, body),
    onMutate: ({ id, body }) => {
      const detailKey = ticketKeys.detail(id)
      const previous = queryClient.getQueryData<Ticket>(detailKey)
      bus.emit("db:optimistic:apply", `edit body #${id}`, TRACE)
      queryClient.setQueryData<Ticket | undefined>(detailKey, (current) =>
        current ? { ...current, body } : current
      )
      return { previous, detailKey }
    },
    onError: (_err, _vars, context) => {
      if (!context) return
      bus.emit("db:optimistic:rollback", "edit body", TRACE)
      queryClient.setQueryData(context.detailKey, context.previous)
    },
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.list() })
      void queryClient.invalidateQueries({ queryKey: ticketKeys.detail(id) })
    },
  })

  const setBody = useCallback(
    (id: number, body: string[]) => {
      bus.emit("ui:interaction", `edit body #${id}`)
      bodyMutation.mutate({ id, body })
    },
    [bodyMutation, bus]
  )

  const remove = useCallback(
    async (id: number) => {
      bus.emit("ui:interaction", `delete #${id}`)
      bus.emit("db:optimistic:apply", `delete #${id}`, TRACE)
      // The row leaves the list immediately; this promise is about the server
      // agreeing, which is what the selection waits on.
      await collection.delete(id).isPersisted.promise
    },
    [bus, collection]
  )

  return {
    list: list.data,
    listState,
    summary: selected.data?.[0],
    detail: detailQuery.data,
    detailState,
    // A write is never something the UI waits on here, so nothing is ever
    // "mutating" from the user's point of view. That *is* the feature.
    isMutating: false,
    error: null,
    create,
    setStatus,
    rename,
    setBody,
    remove,
  }
}
