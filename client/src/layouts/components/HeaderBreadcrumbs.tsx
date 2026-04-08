import { IconChevronRight } from "@tabler/icons-react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"
import { getBreadcrumbs } from "@/features/app-shell/utils/breadcrumbs"

type HeaderBreadcrumbsProps = {
  pathname: string
}

function HeaderBreadcrumbs({ pathname }: HeaderBreadcrumbsProps) {
  const breadcrumbs = getBreadcrumbs(pathname)

  if (!breadcrumbs.length) {
    return <span className="font-medium">Dashboard</span>
  }

  return (
    <nav className="flex items-center gap-1 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <CrumbItem
          key={crumb.to}
          crumb={crumb}
          isFirst={index === 0}
          isLast={index === breadcrumbs.length - 1}
        />
      ))}
    </nav>
  )
}

function CrumbItem({
  crumb,
  isFirst,
  isLast,
}: {
  crumb: { label: string; to: string }
  isFirst: boolean
  isLast: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      {isFirst ? null : (
        <IconChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
      <Link
        className={cn(
          "rounded px-1.5 py-0.5 transition-colors",
          isLast
            ? "font-medium text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        to={crumb.to}
      >
        {crumb.label}
      </Link>
    </div>
  )
}

export default HeaderBreadcrumbs
