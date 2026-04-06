import { useData } from "@/context/DataContext"
import type { ITQueueItem } from "../../types"

export function useITAllRequests(): { data: ITQueueItem[]; isLoading: boolean } {
  const { requests, users } = useData()

  const data: ITQueueItem[] = requests.flatMap((request): ITQueueItem[] => {
    const requester = users.find((user) => user.employeeId === request.requesterId)
    const hod = users.find(
      (user) => user.role === "HOD" && user.departmentId === requester?.departmentId
    )

    return request.items.map((item) => ({
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
      approvedBy: item.approvalHistory.find((entry) => entry.action === "HODApproved")?.approverName,
      itApprovedBy: item.approvalHistory.find((entry) => entry.action === "ITApproved")?.approverName,
    }))
  })

  return { data, isLoading: false }
}
