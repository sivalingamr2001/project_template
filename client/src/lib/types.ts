export type UserRole = "User" | "HOD" | "IT"

export type AccessStatus =
  | "PendingHOD"
  | "PendingIT"
  | "Approved"
  | "Rejected"
  | "Expired"
  | "Revoked"

export type RequestStatus = AccessStatus
export type AccessItemStatus = AccessStatus

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
  employeeCode?: string
}

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

export interface AccessItem {
  id: number
  system: string
  accessType: AccessTypes
  requestedAt: string
  expiresAt: string
  status: AccessItemStatus
  approvalHistory: ApprovalRecord[]
}

export interface AccessRequest {
  id: number
  ticketNumber?: string
  requesterId: number
  requesterName: string
  requesterDept: string
  requestedAt: string
  items: AccessItem[]
  status: RequestStatus
  rejectionReason?: string
  approvalTimeline: ApprovalRecord[]
}

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
