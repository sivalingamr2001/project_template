import { useApp } from "@/context/AppContext"
import { useData } from "@/context/DataContext"
import { useITStats } from "./hooks/useITStats"
import { ITStats } from "./ITStats"
import { ITApprovalQueueTab } from "../Approvals/ITApprovalQueueTab"
import { ActiveAccessTab } from "../ActiveAccess/ActiveAccessTab"
import { ITAllRequestsTab } from "../Approvals/ITAllRequestsTab"
import { AuditLogTab } from "../AuditLog/AuditLogTab"
import { UserTable } from "@/components/shared/UserTable"

export function ITDashboard() {
  const { currentPage, currentUser } = useApp()
  const { users } = useData()
  const stats = useITStats()

  return (
    <div className="space-y-6">
      <WelcomeHeader user={currentUser} />
      {currentPage === "IT_QUEUE" && <ITStats stats={stats} />}
      {currentPage === "IT_QUEUE" && <ITApprovalQueueTab />}
      {currentPage === "IT_ACTIVE_ACCESS" && <ActiveAccessTab />}
      {currentPage === "IT_ALL_REQUESTS" && <ITAllRequestsTab />}
      {currentPage === "IT_LOOKUP" && <UserLookupSection users={users} />}
      {currentPage === "IT_AUDIT_LOG" && <AuditLogTab />}
    </div>
  )
}

function WelcomeHeader({ user }: { user?: { name?: string; email?: string } }) {
  return (
    <div className="space-y-3">
      <h1 className="text-3xl font-bold">IT Dashboard</h1>
      <div className="space-y-1 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
        <p className="text-lg font-semibold text-foreground">
          Welcome, {user?.name || "Guest"}
        </p>
        <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
      </div>
    </div>
  )
}

function UserLookupSection({ users }: { users: any[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">All Users</h2>
      <UserTable data={users} isLoading={false} />
    </div>
  )
}
