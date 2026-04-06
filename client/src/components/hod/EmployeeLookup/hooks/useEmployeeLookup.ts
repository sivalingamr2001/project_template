import { useData } from "@/context/DataContext"
import type { EmployeeLookupResult } from "../../types"

export function useEmployeeLookup(empId: number): {
  data?: EmployeeLookupResult
  isLoading: boolean
} {
  const { requests, users } = useData()

  if (!empId.toString().trim()) {
    return { data: undefined, isLoading: false }
  }

  const employeeRequests = requests.filter((request) =>
    request.requesterId.toString().includes(empId.toString())
  )

  if (employeeRequests.length === 0) {
    return { data: undefined, isLoading: false }
  }

  const first = employeeRequests[0]
  const requester = users.find((user) => user.employeeId === first.requesterId)
  const hod = users.find(
    (user) => user.role === "HOD" && user.departmentId === requester?.departmentId
  )

  const accesses = employeeRequests.flatMap((request) =>
    request.items.length === 0
      ? [
          {
            id: request.id,
            requestId: request.id,
            employeeName: request.requesterName,
            empId: request.requesterId,
            folderName: request.ticketNumber ? `Request ${request.ticketNumber}` : "Request",
            accessType: "-",
            status: request.status,
            requesterEmail: requester?.email,
            requesterCode: requester?.employeeCode,
            department: request.requesterDept,
            hodName: hod?.name,
            hodEmail: hod?.email,
            requestedAt: request.requestedAt,
            approvedBy: request.approvalTimeline.find((entry) => entry.action === "HODApproved")?.approverName,
            itApprovedBy: request.approvalTimeline.find((entry) => entry.action === "ITApproved")?.approverName,
          },
        ]
      : request.items.map((item) => ({
          id: item.id,
          requestId: request.id,
          employeeName: request.requesterName,
          empId: request.requesterId,
          folderName: item.system,
          accessType: item.accessType,
          status: item.status,
          requesterEmail: requester?.email,
          requesterCode: requester?.employeeCode,
          department: request.requesterDept,
          hodName: hod?.name,
          hodEmail: hod?.email,
          requestedAt: request.requestedAt,
          approvedBy: item.approvalHistory.find((entry) => entry.action === "HODApproved")?.approverName,
          itApprovedBy: item.approvalHistory.find((entry) => entry.action === "ITApproved")?.approverName,
        }))
  )

  return {
    data: {
      empId: first.requesterId,
      empName: first.requesterName,
      department: first.requesterDept,
      email: requester?.email,
      employeeCode: requester?.employeeCode,
      hodName: hod?.name,
      hodEmail: hod?.email,
      active: accesses.filter((item) => item.status === "Approved").length,
      pending: accesses.filter((item) => ["PendingHOD", "PendingIT"].includes(item.status)).length,
      expired: accesses.filter((item) => item.status === "Expired").length,
      accesses,
    },
    isLoading: false,
  }
}
