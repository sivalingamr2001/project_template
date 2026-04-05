import { useEffect, useState } from "react"
import { useApp } from "@/hooks/useApp"
import { useData } from "../context/DataContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { MyRequestsTable } from "../components/employee/MyRequestsTable"
import { NewRequestModal } from "../components/employee/NewRequestModal"
import { RequesterStats } from "../components/employee/RequesterStats"
import {
  createAccessRequest,
  fetchAccessRequestsByUser,
  type AccessRequestFormPayload,
} from "../lib/access-request-api"
import { toast } from "sonner"

export function EmployeeDashboard() {
  const [createOpen, setCreateOpen] = useState(false)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [isCreatingRequest, setIsCreatingRequest] = useState(false)
  const { requests, addRequest, setRequests } = useData()
  const { currentUser, setCurrentPage, setSelectedRequestId } = useApp()

  const userRequests = requests.filter((r) => r.requesterId === currentUser?.id)
  const stats = {
    totalRequests: userRequests.length,
    approved: userRequests.filter((r) => r.status === "Approved").length,
    pending: userRequests.filter((r) =>
      ["PendingHOD", "PendingIT"].includes(r.status)
    ).length,
  }

  useEffect(() => {
    if (!currentUser?.employeeId && !currentUser?.id) return

    let cancelled = false

    const loadRequests = async () => {
      try {
        setIsLoadingRequests(true)
        const empId = currentUser.employeeId ?? currentUser.id
        const apiRequests = await fetchAccessRequestsByUser(empId, currentUser)

        if (!cancelled) {
          setRequests(apiRequests)
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load access requests", error)
          toast.error("Failed to load your access requests")
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRequests(false)
        }
      }
    }

    loadRequests()

    return () => {
      cancelled = true
    }
  }, [currentUser, setRequests])

  const handleCreateRequest = async (data: AccessRequestFormPayload) => {
    console.log("Create request:", data)

    if (!currentUser || !data?.details?.length) {
      setCreateOpen(false)
      return
    }

    try {
      setIsCreatingRequest(true)
      const createdRequest = await createAccessRequest(data, currentUser)
      addRequest(createdRequest)
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
            isLoading={isLoadingRequests}
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
