import type { ReactNode } from "react"
import { useApp } from "@/context/AppContext"
import { useData } from "../../context/DataContext"
import {
  LayoutDashboard,
  ClipboardList,
  CheckCircle,
  History,
  Users,
  FileSearch,
  FileText,
  ListChecks,
} from "lucide-react"
import type { Page } from "../../context/AppContext"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLegacyNavigation } from "@/routes/useLegacyNavigation"

interface NavItem {
  label: string
  icon: ReactNode
  page: Page
}

interface SidebarProps {
  collapsed: boolean
}

export function Sidebar({ collapsed }: SidebarProps) {
  const { currentRole, currentPage } = useApp()
  const { requests } = useData()
  const { goTo } = useLegacyNavigation()

  const getPendingCount = () => {
    if (currentRole === "HOD") {
      return requests.filter((request) =>
        request.items.some((item) => item.status === "PendingHOD")
      ).length
    }

    if (currentRole === "IT") {
      return requests.filter((request) =>
        request.items.some((item) => item.status === "PendingIT")
      ).length
    }

    return 0
  }

  const navItems: NavItem[] = [
    ...(currentRole === "User"
      ? [
          {
            label: "Dashboard",
            icon: <LayoutDashboard size={20} />,
            page: "EMPLOYEE_DASHBOARD" as const,
          },
        ]
      : []),
    ...(currentRole === "HOD"
      ? [
          {
            label: "Pending Approvals",
            icon: <CheckCircle size={20} />,
            page: "HOD_APPROVALS" as const,
          },
          {
            label: "Approval History",
            icon: <History size={20} />,
            page: "HOD_HISTORY" as const,
          },
          {
            label: "All Requests",
            icon: <FileText size={20} />,
            page: "HOD_ALL_REQUESTS" as const,
          },
        ]
      : []),
    ...(currentRole === "IT"
      ? [
          {
            label: "Approval Queue",
            icon: <ClipboardList size={20} />,
            page: "IT_QUEUE" as const,
          },
          {
            label: "Active Access",
            icon: <ListChecks size={20} />,
            page: "IT_ACTIVE_ACCESS" as const,
          },
          {
            label: "All Requests",
            icon: <FileText size={20} />,
            page: "IT_ALL_REQUESTS" as const,
          },
          {
            label: "Employee",
            icon: <Users size={20} />,
            page: "IT_LOOKUP" as const,
          },
          {
            label: "Audit Log",
            icon: <FileSearch size={20} />,
            page: "IT_AUDIT_LOG" as const,
          },
        ]
      : []),
  ]

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-secondary transition-all duration-300 ease-in-out ${collapsed ? "w-16" : "w-64"}`}
    >
      <div
        className={`flex h-12.5 items-center border-b border-border px-2 ${collapsed ? "justify-center" : "justify-start"}`}
      >
        {collapsed ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground shadow-sm">
            A
          </div>
        ) : (
          <div className="overflow-hidden">
            <h1 className="truncate text-2xl font-bold text-primary">
              Access Portal
            </h1>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-2 p-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.page
          const pendingCount =
            item.page === "HOD_APPROVALS" || item.page === "IT_QUEUE"
              ? getPendingCount()
              : 0

          const navButton = (
            <button
              onClick={() => goTo(item.page)}
              className={`group relative flex w-full items-center rounded-lg transition-colors ${collapsed ? "mx-auto h-10 w-10 justify-center" : "justify-between px-3 py-2"} ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <div
                className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="truncate font-medium">{item.label}</span>
                )}
              </div>

              {pendingCount > 0 && (
                <span
                  className={`flex items-center justify-center font-bold ${
                    collapsed
                      ? "text-destructive-foreground absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] ring-2 ring-secondary"
                      : `ml-auto rounded-full px-2 py-0.5 text-xs ${isActive ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"}`
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          )

          return (
            <Tooltip key={item.page}>
              <TooltipTrigger asChild>{navButton}</TooltipTrigger>
              {collapsed && (
                <TooltipContent
                  side="right"
                  sideOffset={10}
                  className="flex items-center gap-2"
                >
                  {item.label}
                  {pendingCount > 0 && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
                      {pendingCount}
                    </span>
                  )}
                </TooltipContent>
              )}
            </Tooltip>
          )
        })}
      </nav>
    </aside>
  )
}
