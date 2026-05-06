import {
  type LucideIcon,
  LayoutDashboard,
  FolderSearch,
  Settings,
  BarChart3,
  FileText,
  CircleOff,
  CircleCheckBig,
  Users
} from "lucide-react"

export type NavigationItem = {
  id: string
  label: string
  path: string
  icon: LucideIcon
  children?: any[]
  roles?: string[] // Add roles array to restrict access
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
    children: [
      {
        label: "Project Search",
        path: "/projects",
        icon: FolderSearch,
      },
      {
        label: "Approved Projects",
        path: "/projects/approved",
        icon: CircleCheckBig
      },
      {
        label: "Pending Projects",
        path: "/projects/pending",
        icon: CircleOff
      },
    ],
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
  {
    id: "employees",
    label: "Employees",
    path: "/employees",
    icon: Users,
    roles: ["Admin"], // Only admin can access
  },
]
