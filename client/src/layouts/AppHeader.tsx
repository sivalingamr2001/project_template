import {
  IconBell,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRightCollapse,
} from "@tabler/icons-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "@/context/AuthContext"
import { useAccessWorkspace } from "@/features/access-workspace/hooks/useAccessWorkspace"
import type { NotificationItem } from "@/features/access-workspace/types"
import { cn } from "@/lib/utils"
import NotificationSheet from "./components/NotificationSheet"
import UserMenu from "./components/UserMenu"

type AppHeaderProps = {
  isSidebarCollapsed: boolean
  onToggleSidebar?: () => void
}

export function AppHeader({ isSidebarCollapsed, onToggleSidebar }: AppHeaderProps) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { markNotificationAsRead, notifications } =
    useAccessWorkspace("dashboard")
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const hasUnread = notifications.some((item) => !item.isRead)
  const handleUserMenuToggle = () => setIsUserMenuOpen((value) => !value)
  const handleNotificationToggle = () =>
    setIsNotificationOpen((value) => !value)
  const handleNotificationOpenChange = (isOpen: boolean) =>
    setIsNotificationOpen(isOpen)
  const handleProfile = () => navigate("/profile")

  const handleNotificationClick = async (item: NotificationItem) => {
    try {
      await markNotificationAsRead(item.auditId)
    } finally {
      setIsNotificationOpen(false)
      navigate(`/requests/${item.accessReqId}`)
    }
  }

  return (
    <header className="flex min-h-14 items-center justify-between gap-3 rounded-[0.5rem] border border-border bg-card px-4">
      <div className="flex items-center gap-2">
        <button
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={onToggleSidebar}
        >
          {isSidebarCollapsed ? (
            <IconLayoutSidebarRightCollapse className="h-5 w-5"/>
          ) : (
            <IconLayoutSidebarLeftCollapse className="h-5 w-5" />
          )}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition-colors hover:bg-accent"
          onClick={handleNotificationToggle}
        >
          <IconBell className="size-5" />
          {hasUnread ? (
            <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500" />
          ) : null}
        </button>
        <UserMenu
          isOpen={isUserMenuOpen}
          name={user?.name ?? "User"}
          onLogout={logout}
          onOpenChange={handleUserMenuToggle}
          onProfile={handleProfile}
        />
      </div>
      <NotificationSheet
        isOpen={isNotificationOpen}
        notifications={notifications}
        onOpenChange={handleNotificationOpenChange}
        onNotificationClick={handleNotificationClick}
      />
    </header>
  )
}
