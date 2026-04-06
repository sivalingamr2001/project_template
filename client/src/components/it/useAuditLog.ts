import { useData } from "../../context/DataContext"

export const useAuditLog = (filter: string) => {
  const { requests, users } = useData()

  const data = requests
    .flatMap((request, requestIndex) =>
      (request.approvalTimeline.length > 0
        ? request.approvalTimeline
        : [
            {
              id: request.id,
              approverRole: "HOD" as const,
              approverId: request.requesterId,
              approverName: request.requesterName,
              action: "RequestCreated" as const,
              timestamp: request.requestedAt,
            },
          ]).map((entry, entryIndex) => {
        const requester = users.find((user) => user.employeeId === request.requesterId)
        const hod = users.find(
          (user) => user.role === "HOD" && user.departmentId === requester?.departmentId
        )

        return {
          id: requestIndex * 100 + entryIndex,
          action: entry.action,
          actor: entry.approverName,
          createdOn: entry.timestamp,
          requester: request.requesterName,
          requesterEmail: requester?.email ?? "-",
          department: request.requesterDept,
          hod: hod?.name ?? "-",
          approvedBy:
            request.approvalTimeline.find((item) => item.action === "HODApproved")?.approverName ??
            "-",
          itApprovedBy:
            request.approvalTimeline.find((item) => item.action === "ITApproved")?.approverName ??
            "-",
        }
      })
    )
    .filter((item) => filter === "All" || item.action === filter)

  return { data, isLoading: false }
}
