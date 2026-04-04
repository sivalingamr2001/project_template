import { useApp } from "@/hooks/useApp"
import { ActiveAccessTab } from "./ActiveAccessTab"
import { AuditLogTab } from "./AuditLogTab"
import { ITEmployeeLookupTab } from "./EmployeeLookupTab"
import { ITApprovalQueueTab } from "./ITApprovalQueueTab"
import { ITStats } from "./ITStats"

const mockStats = { queue: 1, active: 16, expiringSoon: 4 }

export function ITDashboard() {
  const { currentPage } = useApp()
  const { currentUser } = useApp()

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">IT Dashboard</h1>
        <div className="space-y-1 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
          <p className="text-lg font-semibold text-foreground">
            Welcome, {currentUser?.name || "Guest"}
          </p>
          <p className="text-sm text-muted-foreground">
            {currentUser?.email || ""}
          </p>
        </div>
      </div>

      {currentPage === "IT_QUEUE" && <ITStats stats={mockStats} />}

      {currentPage === "IT_QUEUE" && <ITApprovalQueueTab />}
      {currentPage === "IT_ACTIVE_ACCESS" && <ActiveAccessTab />}
      {currentPage === "IT_LOOKUP" && <ITEmployeeLookupTab />}
      {currentPage === "IT_AUDIT_LOG" && <AuditLogTab />}
    </div>
  )
}
