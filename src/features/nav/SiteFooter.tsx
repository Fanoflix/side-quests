import { SiteMark } from "./SiteMark"
import { AUTHOR, AUTHOR_URL, LINKEDIN_URL, REPO_URL, SITE_NAME } from "./site"

const LINK =
  "transition-colors hover:text-foreground underline-offset-4 hover:underline"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-xs text-muted-foreground sm:px-6">
        <span className="flex items-center gap-2">
          <SiteMark className="size-4 text-foreground" />
          <span>
            {SITE_NAME} by{" "}
            <a
              href={AUTHOR_URL}
              target="_blank"
              rel="noreferrer"
              className={LINK}
            >
              {AUTHOR}
            </a>
          </span>
        </span>
        <span className="flex gap-4 sm:ml-auto">
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noreferrer"
            className={LINK}
          >
            LinkedIn
          </a>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className={LINK}>
            GitHub
          </a>
          <a
            href={AUTHOR_URL}
            target="_blank"
            rel="noreferrer"
            className={LINK}
          >
            ammarnasir.com
          </a>
        </span>
      </div>
    </footer>
  )
}
