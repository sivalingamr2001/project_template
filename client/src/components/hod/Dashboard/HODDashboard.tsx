import { useApp } from "@/hooks/useApp"
import { useData } from "@/context/DataContext"
import { useHODStats } from "./hooks/useHODStats"
import { HODStats } from "./HODStats"
import { UserTable } from "@/components/shared/UserTable"
import { ApprovalHistoryTab } from "../ApprovalHistoryTab"
import { HODAllRequestsTab } from "../HODAllRequestsTab/HODAllRequestsTab"
import { PendingApprovalsTab } from "../PendingApprovalsTab"

export function HODDashboard() {
  const { currentPage, currentUser } = useApp()
  const { users } = useData()
  const stats = useHODStats()

  return (
    <div className="space-y-6">
      <WelcomeHeader user={currentUser} />
      {currentPage === "HOD_APPROVALS" && <HODStats stats={stats} />}
      {currentPage === "HOD_APPROVALS" && <PendingApprovalsTab />}
      {currentPage === "HOD_HISTORY" && <ApprovalHistoryTab />}
      {currentPage === "HOD_ALL_REQUESTS" && <HODAllRequestsTab />}
      {currentPage === "HOD_LOOKUP" && <UserLookupSection users={users} />}
    </div>
  )
}

function WelcomeHeader({ user }: { user?: { name?: string; email?: string } }) {
  return (
    <div className="space-y-3">
      <h1 className="text-3xl font-bold">HOD Dashboard</h1>
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
