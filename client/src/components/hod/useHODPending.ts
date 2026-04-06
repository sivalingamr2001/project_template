import { useData } from "@/context/DataContext"
import type { ApprovalItem } from "./hod.types"

export const useHODPending = () => {
  const { requests, users } = useData()

  const data: ApprovalItem[] = requests.flatMap((request): ApprovalItem[] => {
    const requester = users.find((user) => user.employeeId === request.requesterId)
    const hod = users.find(
      (user) => user.role === "HOD" && user.departmentId === requester?.departmentId
    )

    if (request.items.length === 0 && request.status === "PendingHOD") {
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
        },
      ]
    }

    return request.items
      .filter((item) => item.status === "PendingHOD")
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
      }))
  })

  return { data, isLoading: false }
}
