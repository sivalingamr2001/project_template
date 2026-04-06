import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  UserCircle2,
} from "lucide-react"
import { useApp } from "@/hooks/useApp"
import { NotificationBell } from "../shared/NotificationBell"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

interface HeaderProps {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export function Header({ sidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const { currentUser, setCurrentPage, logout } = useApp()

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border bg-background p-2">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <UserCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">
                {currentUser?.name ?? "Profile"}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setCurrentPage("USER_PROFILE")}>
              <UserCircle2 className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} variant="destructive">
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
