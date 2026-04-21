import {
  IconChecklist,
  IconClockCheck,
  IconDashboard,
  IconBuilding,
  IconFileInvoice,
  IconShieldCheck,
  IconUsers,
  IconHistory,
} from "@tabler/icons-react"
import type { NavigationSection } from "../types"

export const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    title: "User",
    items: [
      {
        label: "Dashboard",
        to: "/dashboard",
        icon: IconDashboard,
        roles: ["User"],
      },
      {
        label: "My Requests",
        to: "/user/my-requests",
        icon: IconFileInvoice,
        roles: ["User"],
      },
    ],
  },
  {
    title: "HOD",
    items: [
      {
        label: "Pending Approvals",
        to: "/hod/pending-approvals",
        icon: IconChecklist,
        roles: ["Hod"],
      },
      {
        label: "All Requests",
        to: "/hod/all-requests",
        icon: IconFileInvoice,
        roles: ["Hod"],
      },
    ],
  },
  {
    title: "IT",
    items: [
      {
        label: "Approval Queue",
        to: "/it/approval-queue",
        icon: IconShieldCheck,
        roles: ["Admin"],
      },
      {
        label: "Active Access",
        to: "/it/active-access",
        icon: IconClockCheck,
        roles: ["Admin"],
      },
      {
        label: "All Requests",
        to: "/it/all-requests",
        icon: IconFileInvoice,
        roles: ["Admin"],
      },
      {
        label: "Employees",
        to: "/it/employees",
        icon: IconUsers,
        roles: ["Admin"],
      },
      {
        label: "Departments",
        to: "/it/departments",
        icon: IconBuilding,
        roles: ["Admin"],
      },
      {
        label: "Audit Logs",
        to: "/audit-logs",
        icon: IconHistory,
        roles: ["Admin"],
      },
    ],
  },
]
