import type { AccessItemStatus } from "@/lib/types"

export interface AccessListItem {
  id: number
  employeeName: string
  empId: number
  folderName: string
  accessType: string
  status: AccessItemStatus
  requesterEmail?: string
  requesterCode?: string
  department?: string
  hodName?: string
  hodEmail?: string
  requestedAt?: string
  approvedBy?: string
  itApprovedBy?: string
}

export interface ApprovalItem extends AccessListItem {
  requestId: number
  detailId: number
  approvalId: number
  reason?: string
  itsrNumber?: string
}

export interface EmployeeLookupResult {
  empId: number
  empName: string
  department: string
  email?: string
  employeeCode?: string
  hodName?: string
  hodEmail?: string
  active: number
  pending: number
  expired: number
  accesses: (AccessListItem & { requestId: number })[]
}

export interface HODStatsData {
  pendingCount: number
  approvedMonth: number
  rejectedMonth: number
}

export const HOD_KEYS = {
  pending: () => ["hod", "pending"] as const,
  history: () => ["hod", "history"] as const,
  employeeLookup: (empId: number) => ["hod", "employee", empId] as const,
} as const
