import { type LucideIcon, LayoutDashboard, FolderSearch, Settings, BarChart3 } from "lucide-react"

export type NavigationItem = {
  id: string
  label: string
  path: string
  icon: LucideIcon
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    id: "projects",
    label: "Projects",
    path: "/projects",
    icon: FolderSearch,
  },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
  {
    id: "reports",
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
]