import type { ReactNode } from "react"

export type AppRole = "User" | "Hod" | "ItTeam"
export type QueueMode =
  | "dashboard"
  | "hodPending"
  | "hodHistory"
  | "hodAll"
  | "itQueue"
  | "itActive"
  | "itAll"
export type AggregateStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Expired"
  | "Revoked"

export type AccessRequest = {
  accessReqId: number
  accessType: "Not Applicable" | "Read Only" | "Read & Write"
  aggregateStatus: AggregateStatus
  createdOn: string
  empId: number
  folderPath: string
  itsrNo: string | null
  reason: string
  reqTo: number
  status: string
}
export type DashboardAccessRequestDto = {
  accessReqId: number
  accessType: number
  aggregateStatus: number
  empId: number
  folderPath: string
  itsrNo: string | null
  reason: string
  reqTo: number
  status: number
}
export type PaginatedResponse<T> = {
  data: T[]
  page: number
  pageSize: number
  totalCount: number
}
export type NotificationItem = {
  accessReqId: number
  auditId: number
  createdOn: string
  eventType: string
  isRead: boolean
  message: string
  recipientRole: AppRole
}
export type EmployeeRecord = {
  departmentName: string
  email: string
  employeeId: number
  name: string
  role: AppRole
}
export type AuditLogItem = {
  actor: string
  auditId: number
  createdOn: string
  details: string
  eventType: string
  requestId: number
}
export type SummaryCard = { detail: string; label: string; value: string }
export type TableColumn<T> = {
  header: string
  key: string
  render: (row: T) => ReactNode
}
export type AccessTypeLabel = "Not Applicable" | "Read Only" | "Read & Write"
export type AccessRequestItem = {
  accessItemId: number
  accessType: AccessTypeLabel
  createdOn: string
  folderPath: string
  reason: string
}
export type AccessRequestApproval = {
  accessApproveId: number
  approvalStatus: string
  approverId: number
  approverName: string
  approverRole: string
  comments: string
  createdOn: string
}
export type AccessRequestTimeline = {
  auditId: number
  createdOn: string
  eventType: string
  isRead: boolean
  message: string
  recipientEmpId: number
  recipientName: string
  recipientRole: string
}
export type AccessRequestDetails = {
  accessReqId: number
  aggregateStatus: string
  approvals: AccessRequestApproval[]
  createdOn: string
  currentApproverName: string
  currentApproverRole: string
  departmentId: number
  departmentName: string
  empId: number
  items: AccessRequestItem[]
  itsrNo: string | null
  modifiedOn: string | null
  reqTo: number
  requesterName: string
  status: string
  timeline: AccessRequestTimeline[]
}
