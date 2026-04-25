"use client"

import { LogOut, PanelLeftClose, PanelRightClose } from "lucide-react"

import { MobileNav } from "./mobile-nav"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/shared/components/ui/button"

interface HeaderProps {
  title?: string
  isSidebarCollapsed?: boolean
  toggleSidebar?: () => void
}

export function AppHeader({
  title = "Portal",
  isSidebarCollapsed,
  toggleSidebar,
}: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 space-y-3 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="rounded-none border-b border-border/70 bg-card/90 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <MobileNav />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden h-9 w-9 lg:flex"
            >
              {isSidebarCollapsed ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>

            <div className="h-10 w-px bg-foreground/20"></div>

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">
                {title}
              </p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Budget portal workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="ml-1 flex items-center gap-2 border-r border-border pr-4">
              <div className="hidden text-right text-xs sm:block">
                <p className="font-semibold text-foreground">
                  {user?.name ?? "Portal User"}
                </p>
                <p className="text-muted-foreground">
                  {user?.email ?? "finance@company.com"}
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="h-9 w-9"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
