import { useData } from "@/context/DataContext"
import type { AuditLogItem } from "../../types"

export function useAuditLog(): { data: AuditLogItem[]; isLoading: boolean } {
  const { requests } = useData()

  const data: AuditLogItem[] = requests.flatMap((request) =>
    request.approvalTimeline.map((entry) => ({
      id: entry.id,
      action: entry.action,
      actor: entry.approverName,
      createdOn: entry.timestamp,
      requester: request.requesterName,
      requesterEmail: undefined, // Would need to be populated from users data
      department: request.requesterDept,
      hod: undefined, // Would need to be populated from users data
      approvedBy: entry.approverName,
      itApprovedBy: entry.action === "ITApproved" ? entry.approverName : undefined,
    }))
  )

  return { data, isLoading: false }
}
