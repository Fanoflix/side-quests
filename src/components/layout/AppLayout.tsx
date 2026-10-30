import { Outlet } from "@tanstack/react-router"

import { QuestMenu } from "@/features/nav/QuestMenu"
import { SiteFooter } from "@/features/nav/SiteFooter"
import { ToolFooter } from "@/features/nav/ToolFooter"
import { ToolList } from "@/features/nav/ToolList"
import { QuestMenuContext } from "@/features/nav/questMenuContext"
import { TopBar } from "@/features/nav/TopBar"
import { RailContext } from "@/components/stage/railContext"
import { cn } from "@/lib/utils"
import { useAppLayout } from "./useAppLayout"

export function AppLayout() {
  const { nav, menu, openMenu, rail, setRail } = useAppLayout()

  return (
    <QuestMenuContext value={openMenu}>
      <div className="flex min-h-svh flex-col">
        <TopBar {...nav} onSearch={openMenu} />
        {/* One shell for every page, the landing page included. Swapping
            between a centred landing layout and the three-column quest
            layout made every trip home or back jump sideways, and the quest
            list vanished exactly when you'd want it to pick the next one. */}
        <div className="flex-1">
          <div
            className={cn(
              "mx-auto grid w-full max-w-[1480px] gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[10rem_minmax(0,1fr)] xl:gap-12",
              nav.current?.controls &&
                "xl:grid-cols-[10rem_minmax(0,1fr)_19rem]"
            )}
          >
            <aside className="hidden lg:block">
              <ToolList current={nav.current} />
            </aside>
            <RailContext value={rail}>
              <div className="min-w-0">
                <main className="flex flex-col">
                  <Outlet />
                </main>
                {nav.current && nav.prev && nav.next && (
                  <ToolFooter
                    tool={nav.current}
                    prev={nav.prev}
                    next={nav.next}
                  />
                )}
              </div>
            </RailContext>
            {nav.current?.controls && (
              <aside className="hidden xl:block">
                <div
                  key={nav.current.slug}
                  ref={setRail}
                  className="tool-rail sticky top-24 flex max-h-[calc(100svh-7.5rem)] flex-col overflow-x-hidden overflow-y-auto overscroll-contain pr-1"
                />
              </aside>
            )}
          </div>
        </div>
        <SiteFooter />
        <QuestMenu {...menu} />
      </div>
    </QuestMenuContext>
  )
}
