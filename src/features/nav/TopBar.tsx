import { Link } from "@tanstack/react-router"
import { ArrowUpRight, ChevronLeft, ChevronRight, Search } from "lucide-react"

import { CharacterFlow } from "@/features/motion/character-flow/CharacterFlow"
import { ThemeToggle } from "@/features/theme/ThemeToggle"
import { GithubMark } from "./GithubMark"
import { SearchHint } from "./SearchHint"
import { SiteMark } from "./SiteMark"
import { AUTHOR_URL, REPO_URL, SITE_NAME } from "./site"
import type { useToolNav } from "./useToolNav"

const ICON_BUTTON =
  "grid size-9 shrink-0 place-items-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"

type Props = ReturnType<typeof useToolNav> & { onSearch: () => void }

export function TopBar({
  current,
  number,
  total,
  prev,
  next,
  onSearch,
}: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md [view-transition-name:topbar]">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-3 sm:px-5">
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2.5 px-1.5 py-1 text-sm font-semibold tracking-tight"
          aria-label={`${SITE_NAME} home`}
        >
          <SiteMark className="size-5 transition-transform duration-175 ease-snap group-hover:rotate-12" />
          <span className={current ? "hidden sm:inline" : undefined}>
            {SITE_NAME}
          </span>
        </Link>

        {current && (
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-2 overflow-x-clip text-sm"
          >
            <span className="text-border" aria-hidden>
              /
            </span>
            <span className="hidden text-muted-foreground md:inline">
              {current.category}
            </span>
            <span className="hidden text-border md:inline" aria-hidden>
              /
            </span>
            <CharacterFlow
              value={current.title}
              className="font-medium whitespace-nowrap"
            />
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1">
          {current && prev && next && (
            <div className="mr-1 flex items-center border border-border">
              <Link
                to={prev.to}
                className={ICON_BUTTON}
                aria-label={`Previous quest: ${prev.title}`}
                title={`${prev.title}  [`}
              >
                <ChevronLeft className="size-4" />
              </Link>
              <span className="hidden px-1 font-mono text-xs whitespace-nowrap text-muted-foreground tabular-nums sm:inline">
                <CharacterFlow value={number ?? ""} />
                <span className="opacity-50">/{total}</span>
              </span>
              <Link
                to={next.to}
                className={ICON_BUTTON}
                aria-label={`Next quest: ${next.title}`}
                title={`${next.title}  ]`}
              >
                <ChevronRight className="size-4" />
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={onSearch}
            className="group flex h-9 items-center gap-2 px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Search className="size-4" />
            <span className="hidden lg:inline">Find a quest</span>
            <SearchHint held className="hidden sm:inline-block" />
          </button>
          <a
            href={AUTHOR_URL}
            target="_blank"
            rel="noreferrer"
            className="group hidden h-9 items-center gap-1 px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:flex"
          >
            ammarnasir.com
            <ArrowUpRight className="size-3.5 transition-transform duration-175 ease-snap group-hover:translate-x-px group-hover:-translate-y-px" />
          </a>
          <ThemeToggle className={ICON_BUTTON} />
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className={ICON_BUTTON}
            aria-label="Source on GitHub"
          >
            <GithubMark className="size-4" />
          </a>
        </div>
      </div>
    </header>
  )
}
