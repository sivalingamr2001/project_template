import type {
  AccessRequest,
  AccessRequestApproval,
  AccessRequestDetails,
  AccessRequestItem,
  AggregateStatus,
  AuditLogItem,
  EmployeeRecord,
  NotificationItem,
  RequestStatus,
} from "../types"

const API_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7229/api"
const API_ORIGIN = API_URL.replace(/\/api$/, "")
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
  accessGrantedOn: string | null
  accessType: number | string
  accessValidUntil: string | null
  confirmAccessType: number | string
  createdOn: string
  folderPath: string
  hodValidationComments: string
  hodValidationStatus: number | string
  isHodValidated: boolean
  reason: string
}): AccessRequestItem {
  const accessTypeIndex =
    typeof item.accessType === "number"
      ? item.accessType
      : ACCESS_TYPE_MAP.findIndex((value) => value === item.accessType)
  const confirmAccessTypeIndex =
    typeof item.confirmAccessType === "number"
      ? item.confirmAccessType
      : ACCESS_TYPE_MAP.findIndex((value) => value === item.confirmAccessType)
  const hodStatusIndex =
    typeof item.hodValidationStatus === "number"
      ? item.hodValidationStatus
      : AGGREGATE_STATUS_MAP.findIndex(
          (value) => value === item.hodValidationStatus
        )

  return {
    accessItemId: item.accessItemId,
    accessGrantedOn: item.accessGrantedOn,
    accessType: ACCESS_TYPE_MAP[accessTypeIndex] ?? "Not Applicable",
    accessValidUntil: item.accessValidUntil,
    confirmAccessType:
      ACCESS_TYPE_MAP[confirmAccessTypeIndex] ?? "Not Applicable",
    createdOn: item.createdOn,
    folderPath: item.folderPath,
    hodValidationComments: item.hodValidationComments,
    hodValidationStatus: AGGREGATE_STATUS_MAP[hodStatusIndex] ?? "Pending",
    isHodValidated: item.isHodValidated,
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
    accessGrantedOn: string | null
    accessType: number | string
    accessValidUntil: string | null
    confirmAccessType: number | string
    createdOn: string
    folderPath: string
    hodValidationComments: string
    hodValidationStatus: number | string
    isHodValidated: boolean
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

  const payload = (await response.json()) as Array<{
    accessReqId: number
    auditId: number
    createdOn: string
    eventType: string
    isRead: boolean
    message: string
    recipientEmpId: number
    recipientName: string
    recipientRole: string
  }>

  return payload.map((item) => ({
    accessReqId: item.accessReqId,
    auditId: item.auditId,
    createdOn: item.createdOn,
    eventType: item.eventType,
    isRead: item.isRead,
    message: item.message,
    recipientRole:
      item.recipientRole === "Hod" || item.recipientRole === "ItTeam"
        ? item.recipientRole
        : "User",
  }))
}

export async function markNotificationAsRead(
  auditId: number,
  employeeId: number
) {
  const response = await fetch(`${API_URL}/notifications/${auditId}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId }),
  })

  if (!response.ok) throw new Error("Unable to update notification.")
}

export async function fetchEmployees(): Promise<EmployeeRecord[]> {
  const response = await fetch(`${API_ORIGIN}/api/User/GetAllUsers`)
  if (!response.ok) throw new Error("Unable to load employees.")

  const payload = (await response.json()) as {
    users: Array<{
      departmentName: string
      email: string
      employeeId: number
      name: string
      role: string
    }>
  }

  return payload.users.map((user) => ({
    departmentName: user.departmentName,
    email: user.email,
    employeeId: user.employeeId,
    name: user.name,
    role:
      user.role === "Hod" || user.role === "ItTeam" ? user.role : "User",
  }))
}

export async function fetchAuditLogs(): Promise<AuditLogItem[]> {
  const response = await fetch(`${API_URL}/audit-logs`)
  if (!response.ok) throw new Error("Unable to load audit logs.")

  const payload = (await response.json()) as Array<{
    actor: string
    auditId: number
    createdOn: string
    details: string
    eventType: string
    requestId: number
  }>

  return payload
}

export async function reviewAccessRequestByHod(
  accessReqId: number,
  reviewerEmployeeId: number,
  items: Array<{
    accessItemId: number
    approved: boolean
    comments: string
    confirmAccessType: number
    isValidated: boolean
  }>
) {
  const response = await fetch(
    `${API_URL}/access-requests/${accessReqId}/hod-review`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewerEmployeeId,
        items,
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
