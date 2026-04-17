import type {
  AccessRequest,
  AccessRequestApproval,
  AccessRequestDetails,
  AccessRequestItem,
  AggregateStatus,
  AppRole,
  AuditLogItem,
  Department,
  EmployeeRecord,
  NotificationItem,
  PaginatedResponse,
  RequestStatus,
} from "../types"
import type { AuthUser } from "@/context/AuthContext"

const API_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://localhost:5001/api"
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
  status: number | string
  createdOn: string
  folderPath: string
  reason: string
}): AccessRequestItem {
  const index =
    typeof item.accessType === "number"
      ? item.accessType
      : ACCESS_TYPE_MAP.findIndex((value) => value === item.accessType)
  const statusIndex =
    typeof item.status === "number"
      ? item.status
      : STATUS_MAP.findIndex((value) => value === item.status)

  return {
    accessItemId: item.accessItemId,
    status: (STATUS_MAP[statusIndex] ?? "Submitted") as RequestStatus,
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
    status: number | string
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
      status: (typeof item.status === "number"
        ? STATUS_MAP[item.status]
        : item.status) as RequestStatus,
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
  employeeId: number,
  page = 1,
  pageSize = 50
): Promise<PaginatedResponse<NotificationItem>> {
  const response = await fetch(
    `${API_URL}/notifications/${employeeId}?Page=${page}&PageSize=${pageSize}`
  )
  if (!response.ok) throw new Error("Unable to load notifications.")

  const payload = await response.json()
  return {
    data: payload.data.map((item: any) => ({
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
    })),
    page: payload.page,
    pageSize: payload.pageSize,
    totalCount: payload.totalCount,
  }
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

export async function fetchAuditLogs(
  page = 1,
  pageSize = 50
): Promise<PaginatedResponse<AuditLogItem>> {
  const response = await fetch(
    `${API_URL}/audit-logs?Page=${page}&PageSize=${pageSize}`
  )
  if (!response.ok) throw new Error("Unable to load audit logs.")

  const payload = await response.json()
  return {
    data: payload.data.map((item: any) => ({
      auditId: item.auditId,
      actor: item.actor,
      eventType: item.eventType,
      requestId: item.requestId,
      createdOn:
        typeof item.createdOn === "string"
          ? item.createdOn
          : new Date(item.createdOn).toLocaleString(),
      details: item.details,
    })),
    page: payload.page,
    pageSize: payload.pageSize,
    totalCount: payload.totalCount,
  }
}

export async function fetchAllUsers(
  page = 1,
  pageSize = 10
): Promise<PaginatedResponse<EmployeeRecord>> {
  const response = await fetch(
    `${API_URL}/User/GetAllUsers?Page=${page}&PageSize=${pageSize}`
  )
  if (!response.ok) throw new Error("Unable to load employees.")

  const payload = await response.json()
  return {
    data: payload.data.map((item: any) => ({
      userId: item.userId,
      employeeId: item.employeeId,
      name: item.name,
      departmentName: item.departmentName,
      role: item.role as AppRole,
      email: item.email,
    })),
    page: payload.page,
    pageSize: payload.pageSize,
    totalCount: payload.totalCount,
  }
}

export async function fetchUserProfile(employeeId: number): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/User/${employeeId}`)
  if (!response.ok) throw new Error("Unable to load user profile.")
  return response.json()
}

export type UpdateUserPayload = {
  employeeId?: number
  userName?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  location?: string
  departmentId?: number
  departmentName?: string
  role?: AppRole
}

export async function updateUserProfile(
  userId: number,
  payload: UpdateUserPayload
): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/User/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error("Unable to update user profile.")
  return response.json()
}

export type CreateUserPayload = {
  employeeId: number
  userName: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  departmentId?: number
  departmentName?: string
  role?: AppRole
  password: string
}

export async function createUser(
  payload: CreateUserPayload
): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/User`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const message = await response
      .json()
      .then((data) => data?.message as string)
      .catch(() => null)
    throw new Error(message || "Unable to create user.")
  }

  return response.json()
}

export async function fetchDepartments(
  page = 1,
  pageSize = 10
): Promise<Department[]> {
  const response = await fetch(
    `${API_URL}/departments?Page=${page}&PageSize=${pageSize}`
  )
  if (!response.ok) throw new Error("Unable to load departments.")
  const payload = await response.json()
  return (payload.data ?? []) as Department[]
}

export async function createDepartment(
  department: Department
): Promise<Department> {
  const response = await fetch(`${API_URL}/departments/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(department),
  })

  if (!response.ok) {
    const message = await response
      .json()
      .then((data) => data?.message as string)
      .catch(() => null)
    throw new Error(message || "Unable to create department.")
  }

  return response.json()
}

export async function updateDepartment(
  department: Department
): Promise<Department> {
  const response = await fetch(`${API_URL}/departments/${department.deptId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: department.name }),
  })

  if (!response.ok) {
    const message = await response
      .json()
      .then((data) => data?.message as string)
      .catch(() => null)
    throw new Error(message || "Unable to update department.")
  }

  return response.json()
}

export async function updateUserPassword(
  employeeId: number,
  password: string
): Promise<void> {
  const response = await fetch(`${API_URL}/User/${employeeId}/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  })

  if (!response.ok) {
    const message = await response
      .json()
      .then((data) => data?.message as string)
      .catch(() => null)
    throw new Error(message || "Unable to update password.")
  }
}

export async function reviewAccessRequestByHod(
  accessReqId: number,
  accessItemId: number,
  reviewerEmployeeId: number,
  approved: boolean,
  comments: string,
  confirmAccessType?: number
) {
  const response = await fetch(
    `${API_URL}/access-requests/${accessReqId}/${accessItemId}/hod-review`,
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
  accessItemId: number,
  reviewerEmployeeId: number,
  approved: boolean,
  comments: string,
  itsrNo: string,
  confirmAccessType?: number
) {
  const response = await fetch(
    `${API_URL}/access-requests/${accessReqId}/${accessItemId}/it-review`,
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
  accessItemId: number,
  reviewerEmployeeId: number,
  comments: string
) {
  const response = await fetch(
    `${API_URL}/access-requests/${accessReqId}/${accessItemId}/revoke`,
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
