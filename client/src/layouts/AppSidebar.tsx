import { IconFolders } from "@tabler/icons-react"

import { useAuth } from "@/context/AuthContext"
import { NAVIGATION_SECTIONS } from "@/features/app-shell/utils/navigation"

import SidebarGroup from "./components/SidebarGroup"

type AppSidebarProps = {
  isCollapsed: boolean
}

function AppSidebar({ isCollapsed }: AppSidebarProps) {
  const { user } = useAuth()
  const role =
    user?.role === "Hod" || user?.role === "ItTeam" ? user.role : "User"
  const sections = NAVIGATION_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(role)),
  })).filter((section) => section.items.length)

  return (
    <aside
      className={`flex h-full flex-col rounded-[0.75rem] border border-sidebar-border bg-sidebar p-4 text-sidebar-foreground ${isCollapsed ? "w-20" : "w-72"}`}
    >
      <div
        className={`mb-6 flex items-center rounded-2xl bg-sidebar-accent p-3 ${isCollapsed ? "justify-center bg-transparent" : "gap-3"}`}
      >
        <div className="rounded-2xl bg-sidebar-primary p-3 text-sidebar-primary-foreground">
          <IconFolders className="size-5" />
        </div>
        {isCollapsed ? null : (
          <div>
            <p className="font-semibold">File Access</p>
            <p className="text-sm text-muted-foreground">Portal</p>
          </div>
        )}
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto">
        {sections.map((section) => (
          <SidebarGroup
            key={section.title}
            isCollapsed={isCollapsed}
            section={section}
          />
        ))}
      </div>
    </aside>
  )
}

export { AppSidebar }
