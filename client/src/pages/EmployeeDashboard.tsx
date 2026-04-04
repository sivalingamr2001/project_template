import { useState } from "react"
import { useApp } from "@/hooks/useApp"
import { useData } from "../context/DataContext"
import type { AccessRequest } from "../lib/types"
import { generateId } from "../lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { MyRequestsTable } from "../components/employee/MyRequestsTable"
import { NewRequestModal } from "../components/employee/NewRequestModal"
import { RequesterStats } from "../components/employee/RequesterStats"

export function EmployeeDashboard() {
  const [createOpen, setCreateOpen] = useState(false)
  const { requests, addRequest } = useData()
  const { currentUser, setCurrentPage, setSelectedRequestId } = useApp()

  const userRequests = requests.filter((r) => r.requesterId === currentUser?.id)
  const stats = {
    totalRequests: userRequests.length,
    approved: userRequests.filter((r) => r.status === "ACTIVE").length,
    pending: userRequests.filter((r) =>
      ["PENDING", "HOD_APPROVED"].includes(r.status)
    ).length,
  }

  const handleCreateRequest = (data: any) => {
    console.log("Create request:", data)

    if (!currentUser || !data?.details?.length) {
      setCreateOpen(false)
      return
    }

    const requestId = generateId()
    const now = new Date().toISOString()
    const items = data.details.map((detail: any) => ({
      id: generateId(),
      system: detail.folderName || "Unknown system",
      accessType: detail.accessType || "Read only",
      requestedAt: now,
      expiresAt: new Date(
        Date.now() + (detail.durationDays || 30) * 86400000
      ).toISOString(),
      status: "PENDING" as const,
      approvalHistory: [],
    }))

    const newRequest: AccessRequest = {
      id: requestId,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterDept: currentUser.department || "Unknown",
      requestedAt: now,
      items,
      status: "PENDING",
      approvalTimeline: [],
    }

    addRequest(newRequest)
    setCreateOpen(false)
  }

  const handleViewDetail = (id: number) => {
    setSelectedRequestId(id)
    setCurrentPage("EMPLOYEE_REQUEST_DETAIL")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Employee Dashboard</h1>
        <div className="space-y-1 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
          <p className="text-lg font-semibold text-foreground">
            Welcome, {currentUser?.name || "Guest"}
          </p>
          <p className="text-sm text-muted-foreground">
            {currentUser?.email || ""}
          </p>
        </div>
      </div>

      <RequesterStats stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <MyRequestsTable
            data={userRequests}
            isLoading={false}
            onViewDetail={handleViewDetail}
            onNewRequest={() => setCreateOpen(true)}
          />
        </CardContent>
      </Card>

      <NewRequestModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateRequest}
        isPending={false}
      />
    </div>
  )
}
