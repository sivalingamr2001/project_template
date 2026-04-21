"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { NAVIGATION_ITEMS } from "@/lib/navigationItems"
import { PORTAL_CONFIG } from "@/lib/portalConfig"
import { cn } from "@/lib/utils"

type SidebarProps = {
  variant?: "desktop" | "mobile"
  isCollapsed?: boolean
}

export function AppSidebar({
  variant = "desktop",
  isCollapsed = false,
}: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const location = useLocation()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "bg-card p-4 overflow-y-auto transition-all duration-300",
          !isCollapsed && "lg:border-r lg:border-border",
          variant === "desktop"
            ? "fixed top-0 left-0 z-30 hidden h-screen lg:block"
            : "h-full w-full",
          isCollapsed ? "w-20 px-2" : "w-64"
        )}
      >
        <div
          className={cn(
            "mb-6 flex items-center gap-2",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <Link to={PORTAL_CONFIG.brand.homePath} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
              JP
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {PORTAL_CONFIG.brand.name}
                </p>
                <p className="text-xs text-muted-foreground">Budget management portal</p>
              </div>
            )}
          </Link>
        </div>

        <nav className="space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path)

            const linkContent = (
              <Link
                key={item.id}
                to={item.path}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                  isCollapsed && "justify-center px-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  hoveredItem === item.path &&
                    !isActive &&
                    !isCollapsed &&
                    "translate-x-1"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )

            if (isCollapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return <div key={item.id}>{linkContent}</div>
          })}
        </nav>
      </aside>
    </TooltipProvider>
  )
}

export default AppSidebar
