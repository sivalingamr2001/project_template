import { useApp } from "@/hooks/useApp"
import { HODStats } from "./HODStats"
import { ApprovalHistoryTab } from "./ApprovalHistoryTab"
import { EmployeeLookupTab } from "./EmployeeLookupTab"
import { PendingApprovalsTab } from "./PendingApprovalsTab"

const mockStats = { pendingCount: 3, approvedMonth: 12, rejectedMonth: 2 }

export function HODDashboard() {
  const { currentPage } = useApp()
  const { currentUser } = useApp()

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

      {currentPage === "HOD_APPROVALS" && <HODStats stats={mockStats} />}

      {currentPage === "HOD_APPROVALS" && <PendingApprovalsTab />}
      {currentPage === "HOD_HISTORY" && <ApprovalHistoryTab />}
      {currentPage === "HOD_LOOKUP" && <EmployeeLookupTab />}
    </div>
  )
}
