import type {
  ApprovalItem,
  EmployeeLookupResult,
  AccessListItem,
} from "../hod/hod.types"

export interface AuditLogItem {
  id: number
  action: string
  actor: string
  createdOn: string
  requester?: string
  requesterEmail?: string
  department?: string
  hod?: string
  approvedBy?: string
  itApprovedBy?: string
}

export type ITQueueItem = ApprovalItem
export type ActiveAccessItem = AccessListItem & { expiresAt?: string; requestId: number }
export type ITEmployeeLookupResult = EmployeeLookupResult

export const itKeys = {
  queue: () => ["it", "queue"] as const,
  activeAccess: () => ["it", "active"] as const,
  employeeLookup: (empId: number) => ["it", "employee", empId] as const,
  auditLog: (filter: string) => ["it", "auditLog", filter] as const,
}
