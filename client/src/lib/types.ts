// Backend enum mappings
export type UserRole = "User" | "HOD" | "IT"

export const Roles = {
  EMPLOYEE: "User" as const, // Backend "User"
  HOD: "HOD" as const, // Backend "HOD"
  IT: "IT" as const, // Backend "IT"
} as const

export type AccessStatus = "PendingHOD" | "PendingIT" | "Approved" | "Rejected" | "Expired" | "Revoked"

export type AccessTypes = "NotApplicable" | "ReadOnly" | "ReadAndWrite"

export type ApprovalType = "HOD" | "IT"

export type AuditAction =
  | "RequestCreated"
  | "HODApproved"
  | "HODRejected"
  | "ITApproved"
  | "ITRejected"
  | "AccessGranted"
  | "Revoked"
  | "Expired"
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  employeeId?: number
  departmentId?: number
  department?: string
  location?: string
  phone?: string
  hod?: {
    employeeId: number
    userName: string
    email: string
  }
}

// Request status types (mapped to backend AccessStatus)
export type RequestStatus = AccessStatus
export type AccessItemStatus = AccessStatus

// Access item types
export interface AccessItem {
  id: number
  system: string
  accessType: AccessTypes
  requestedAt: string
  expiresAt: string
  status: AccessItemStatus
  approvalHistory: ApprovalRecord[]
}

// Approval record for audit trail
export interface ApprovalRecord {
  id: number
  approverRole: ApprovalType
  approverId: number
  approverName: string
  action: AuditAction
  comment?: string
  timestamp: string
  previousStatus?: AccessItemStatus
}

// Main request type
export interface AccessRequest {
  id: number
  requesterId: number
  requesterName: string
  requesterDept: string
  requestedAt: string
  items: AccessItem[]
  status: RequestStatus
  rejectionReason?: string
  approvalTimeline: ApprovalRecord[]
}

// Notification types
export interface Notification {
  id: number
  userId: number
  role: UserRole
  type:
    | "PENDING_APPROVAL"
    | "APPROVED"
    | "REJECTED"
    | "EXPIRING_SOON"
    | "EXPIRED"
  requestid: number
  message: string
  read: boolean
  createdAt: string
}

// Filter and sort types
export interface RequestFilters {
  status?: RequestStatus[]
  department?: string
  dateFrom?: string
  dateTo?: string
  searchTerm?: string
}

export interface SortOptions {
  field: "requestedAt" | "expiresAt" | "status"
  order: "asc" | "desc"
}

// Analytics types
export interface AnalyticsData {
  totalRequests: number
  pendingRequests: number
  approvedToday: number
  expiringWithin30Days: number
  revokedCount: number
  approvalTrend: Array<{
    date: string
    count: number
  }>
}
