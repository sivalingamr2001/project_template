import { useApp } from "@/hooks/useApp"
import { useData } from "@/context/DataContext"
import { HODStats } from "./HODStats"
import { ApprovalHistoryTab } from "./ApprovalHistoryTab"
import { EmployeeLookupTab } from "./EmployeeLookupTab"
import { PendingApprovalsTab } from "./PendingApprovalsTab"

export function HODDashboard() {
  const { currentPage } = useApp()
  const { currentUser } = useApp()
  const { requests } = useData()
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const stats = {
    pendingCount: requests
      .flatMap((request) => request.items)
      .filter((item) => item.status === "PendingHOD").length,
    approvedMonth: requests
      .flatMap((request) => request.approvalTimeline)
      .filter((entry) => {
        const date = new Date(entry.timestamp)
        return (
          entry.action === "HODApproved" &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        )
      }).length,
    rejectedMonth: requests
      .flatMap((request) => request.approvalTimeline)
      .filter((entry) => {
        const date = new Date(entry.timestamp)
        return (
          entry.action === "HODRejected" &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        )
      }).length,
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">HOD Dashboard</h1>
        <div className="space-y-1 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
          <p className="text-lg font-semibold text-foreground">
            Welcome, {currentUser?.name || "Guest"}
          </p>
          <p className="text-sm text-muted-foreground">
            {currentUser?.email || ""}
          </p>
        </div>
      </div>

      {currentPage === "HOD_APPROVALS" && <HODStats stats={stats} />}

      {currentPage === "HOD_APPROVALS" && <PendingApprovalsTab />}
      {currentPage === "HOD_HISTORY" && <ApprovalHistoryTab />}
      {currentPage === "HOD_LOOKUP" && <EmployeeLookupTab />}
    </div>
  )
}
