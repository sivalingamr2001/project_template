import { useData } from "@/context/DataContext"
import type { ITQueueItem } from "../../types"

export function useITQueue(): { data: ITQueueItem[]; isLoading: boolean } {
  const { requests, users } = useData()

  const data: ITQueueItem[] = requests.flatMap((request): ITQueueItem[] => {
    const requester = users.find((user) => user.employeeId === request.requesterId)
    const hod = users.find(
      (user) => user.role === "HOD" && user.departmentId === requester?.departmentId
    )
    const hodApproval = request.approvalTimeline.find((entry) => entry.action === "HODApproved")

    if (request.items.length === 0 && request.status === "PendingIT") {
      return [
        {
          id: request.id,
          requestId: request.id,
          detailId: request.id,
          approvalId: request.id,
          employeeName: request.requesterName,
          empId: request.requesterId,
          folderName: request.ticketNumber ? `Request ${request.ticketNumber}` : "Request",
          accessType: "-",
          status: request.status,
          reason: undefined,
          requesterEmail: requester?.email,
          requesterCode: requester?.employeeCode,
          department: request.requesterDept,
          hodName: hod?.name,
          hodEmail: hod?.email,
          requestedAt: request.requestedAt,
          approvedBy: hodApproval?.approverName ?? hod?.name,
        },
      ]
    }

    return request.items
      .filter((item) => item.status === "PendingIT")
      .map((item) => ({
        id: item.id,
        requestId: request.id,
        detailId: item.id,
        approvalId: item.id,
        employeeName: request.requesterName,
        empId: request.requesterId,
        folderName: item.system,
        accessType: item.accessType,
        status: item.status,
        reason: request.rejectionReason,
        requesterEmail: requester?.email,
        requesterCode: requester?.employeeCode,
        department: request.requesterDept,
        hodName: hod?.name,
        hodEmail: hod?.email,
        requestedAt: request.requestedAt,
        approvedBy: item.approvalHistory.find((entry) => entry.action === "HODApproved")?.approverName ?? hodApproval?.approverName ?? hod?.name,
      }))
  })

  return { data, isLoading: false }
}
