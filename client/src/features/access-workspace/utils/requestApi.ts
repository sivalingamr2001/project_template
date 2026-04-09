import type {
  AccessRequest,
  AccessRequestApproval,
  AccessRequestDetails,
  AccessRequestItem,
  AggregateStatus,
  AppRole,
  AuditLogItem,
  EmployeeRecord,
  NotificationItem,
  RequestStatus,
} from "../types"

const API_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7229/api"
const ACCESS_TYPE_MAP = ["Not Applicable", "Read Only", "Read & Write"] as const
const AGGREGATE_STATUS_MAP = [
  "Pending",
  "Approved",
  "Rejected",
  "Expired",
  "Revoked",
] as const
const STATUS_MAP = [
  "Submitted",
  "Pending HOD",
  "Pending IT",
  "Approved HOD",
  "Approved IT",
  "Access Granted",
  "Rejected HOD",
  "Rejected IT",
  "Access Rejected",
  "Expired",
  "Revoked",
] as const

function mapAccessItem(item: {
  accessItemId: number
  accessType: number | string
  createdOn: string
  folderPath: string
  reason: string
}): AccessRequestItem {
  const index =
    typeof item.accessType === "number"
      ? item.accessType
      : ACCESS_TYPE_MAP.findIndex((value) => value === item.accessType)
  return {
    accessItemId: item.accessItemId,
    accessType: ACCESS_TYPE_MAP[index] ?? "Not Applicable",
    createdOn: item.createdOn,
    folderPath: item.folderPath,
    reason: item.reason,
  }
}

function mapApproval(item: {
  accessApproveId: number
  approvalStatus: number | string
  approverId: number
  approverName: string
  approverRole: string
  comments: string
  createdOn: string
}): AccessRequestApproval {
  const index =
    typeof item.approvalStatus === "number"
      ? item.approvalStatus
      : STATUS_MAP.findIndex((value) => value === item.approvalStatus)
  return {
    accessApproveId: item.accessApproveId,
    approvalStatus: STATUS_MAP[index] ?? "Submitted",
    approverId: item.approverId,
    approverName: item.approverName,
    approverRole: item.approverRole,
    comments: item.comments,
    createdOn: item.createdOn,
  }
}

function mapAccessRequestDetails(details: {
  accessReqId: number
  aggregateStatus: number | string
  approvals: Array<{
    accessApproveId: number
    approvalStatus: number | string
    approverId: number
    approverName: string
    approverRole: string
    comments: string
    createdOn: string
  }>
  createdOn: string
  currentApproverName: string
  currentApproverRole: string
  departmentId: number
  departmentName: string
  empId: number
  items: Array<{
    accessItemId: number
    accessType: number | string
    createdOn: string
    folderPath: string
    reason: string
  }>
  itsrNo: string | null
  modifiedOn: string | null
  reqTo: number
  requesterName: string
  status: number | string
  timeline: AccessRequestDetails["timeline"]
}): AccessRequestDetails {
  const statusIndex =
    typeof details.status === "number"
      ? details.status
      : STATUS_MAP.findIndex((value) => value === details.status)
  const aggregateIndex =
    typeof details.aggregateStatus === "number"
      ? details.aggregateStatus
      : AGGREGATE_STATUS_MAP.findIndex(
          (value) => value === details.aggregateStatus
        )
  return {
    ...details,
    aggregateStatus: AGGREGATE_STATUS_MAP[aggregateIndex] ?? "Pending",
    approvals: details.approvals.map(mapApproval),
    items: details.items.map(mapAccessItem),
    status: STATUS_MAP[statusIndex] ?? "Submitted",
  }
}

export async function fetchAccessRequests(
  employeeId: number
): Promise<AccessRequest[]> {
  const response = await fetch(
    `${API_URL}/dashboard/${employeeId}?Page=1&PageSize=10`
  )
  if (!response.ok) throw new Error("Unable to load access requests.")

  const payload = await response.json()

  return payload.data.map((request: any) => ({
    ...request,
    // Explicitly cast to the Map types so TS is happy
    status: (typeof request.status === "number"
      ? STATUS_MAP[request.status]
      : request.status) as RequestStatus,

    accessItems: request.accessItems.map((item: any) => ({
      ...item,
      accessType: (typeof item.accessType === "number"
        ? ACCESS_TYPE_MAP[item.accessType]
        : item.accessType) as AccessRequestItem["accessType"],
    })),

    aggregateStatus: (typeof request.aggregateStatus === "number"
      ? AGGREGATE_STATUS_MAP[request.aggregateStatus]
      : request.aggregateStatus) as AggregateStatus,
  }))
}

export async function fetchAccessRequestDetails(
  accessReqId: number,
  viewerEmployeeId: number
) {
  const response = await fetch(
    `${API_URL}/access-requests/${accessReqId}?viewerEmployeeId=${viewerEmployeeId}`
  )
  if (!response.ok) throw new Error("Unable to load request details.")
  const payload = await response.json()
  return mapAccessRequestDetails(payload)
}

export async function fetchNotifications(
  employeeId: number
): Promise<NotificationItem[]> {
  const response = await fetch(`${API_URL}/notifications/${employeeId}`)
  if (!response.ok) throw new Error("Unable to load notifications.")

  const payload = await response.json()
  return payload.map((item: any) => ({
    auditId: item.auditId,
    accessReqId: item.accessReqId,
    eventType: item.eventType,
    message: item.message,
    recipientRole: item.recipientRole as AppRole,
    createdOn:
      typeof item.createdOn === "string"
        ? item.createdOn
        : new Date(item.createdOn).toLocaleString(),
    isRead: item.isRead,
  }))
}

export async function markNotificationRead(
  auditId: number,
  employeeId: number
) {
  const response = await fetch(`${API_URL}/notifications/${auditId}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ EmployeeId: employeeId }),
  })
  if (!response.ok) throw new Error("Unable to update notification status.")
}

export async function fetchAuditLogs(): Promise<AuditLogItem[]> {
  const response = await fetch(`${API_URL}/audit-logs`)
  if (!response.ok) throw new Error("Unable to load audit logs.")

  const payload = await response.json()
  return payload.map((item: any) => ({
    auditId: item.auditId,
    actor: item.actor,
    eventType: item.eventType,
    requestId: item.requestId,
    createdOn:
      typeof item.createdOn === "string"
        ? item.createdOn
        : new Date(item.createdOn).toLocaleString(),
    details: item.details,
  }))
}

export async function fetchAllUsers(): Promise<EmployeeRecord[]> {
  const response = await fetch(`${API_URL}/User/GetAllUsers`)
  if (!response.ok) throw new Error("Unable to load employees.")

  const payload = await response.json()
  return payload.users.map((item: any) => ({
    employeeId: item.employeeId,
    name: item.name,
    departmentName: item.departmentName,
    role: item.role as AppRole,
    email: item.email,
  }))
}

export async function reviewAccessRequestByHod(
  accessReqId: number,
  reviewerEmployeeId: number,
  approved: boolean,
  comments: string,
  confirmAccessType?: number
) {
  const response = await fetch(
    `${API_URL}/access-requests/${accessReqId}/hod-review`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewerEmployeeId,
        approved,
        comments,
        confirmAccessType: confirmAccessType || 1,
      }),
    }
  )
  if (!response.ok) throw new Error("Unable to complete HOD review.")
}

export async function reviewAccessRequestByIt(
  accessReqId: number,
  reviewerEmployeeId: number,
  approved: boolean,
  comments: string,
  itsrNo: string,
  confirmAccessType?: number
) {
  const response = await fetch(
    `${API_URL}/access-requests/${accessReqId}/it-review`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewerEmployeeId,
        approved,
        comments,
        itsrNo,
        confirmAccessType: confirmAccessType || 1,
      }),
    }
  )
  if (!response.ok) throw new Error("Unable to complete IT review.")
}

export async function revokeAccessRequest(
  accessReqId: number,
  reviewerEmployeeId: number,
  comments: string
) {
  const response = await fetch(
    `${API_URL}/access-requests/${accessReqId}/revoke`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewerEmployeeId,
        comments,
      }),
    }
  )

  if (!response.ok) throw new Error("Unable to revoke access request.")
}
