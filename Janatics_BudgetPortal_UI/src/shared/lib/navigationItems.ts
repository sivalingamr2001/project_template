import {
  type LucideIcon,
  LayoutDashboard,
  FolderSearch,
  Settings,
  BarChart3,
  FileText,
} from "lucide-react"

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
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "projects",
    label: "Projects",
    path: "/projects",
    icon: FolderSearch,
  },
  {
    id: "plan-entry",
    label: "Plan Entry",
    path: "/plan-entry",
    icon: Settings,
  },
  {
    id: "reports",
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
  {
    id: "budget-template",
    label: "Budget Template",
    path: "/budget-template",
    icon: FileText,
  },
]
