import { useState } from "react"
import { toast } from "sonner"
import { useApp } from "@/hooks/useApp"
import { useData } from "../context/DataContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { MyRequestsTable } from "../components/employee/MyRequestsTable"
import { NewRequestModal } from "../components/employee/NewRequestModal"
import { RequesterStats } from "../components/employee/RequesterStats"
import type { AccessRequestFormPayload } from "../lib/access-request-api"

export function EmployeeDashboard() {
  const [createOpen, setCreateOpen] = useState(false)
  const [isCreatingRequest, setIsCreatingRequest] = useState(false)
  const { requests, addRequest } = useData()
  const { currentUser, setCurrentPage, setSelectedRequestId } = useApp()

  const userRequests = requests.filter((request) => request.requesterId === currentUser?.id)
  const stats = {
    totalRequests: userRequests.length,
    approved: userRequests.filter((request) => request.status === "Approved").length,
    pending: userRequests.filter((request) =>
      ["PendingHOD", "PendingIT"].includes(request.status)
    ).length,
  }

  const handleCreateRequest = async (data: AccessRequestFormPayload) => {
    if (!currentUser || !data.details.length) {
      setCreateOpen(false)
      return
    }

    try {
      setIsCreatingRequest(true)
      await addRequest(data)
      toast.success("Access request created successfully")
      setCreateOpen(false)
    } catch (error) {
      console.error("Failed to create request", error)
      toast.error("Failed to create access request")
    } finally {
      setIsCreatingRequest(false)
    }
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
          <p className="text-sm text-muted-foreground">{currentUser?.email || ""}</p>
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
        isPending={isCreatingRequest}
      />
    </div>
  )
}
