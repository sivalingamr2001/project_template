import type {
  AccessRequest,
  AccessStatus,
  AccessTypes,
  ApprovalRecord,
  AuditAction,
  Notification,
  User,
  UserRole,
} from "./types"

export interface AccessRequestFormDetail {
  folderName: string
  accessType: string
  reason: string
  durationDays: number
}

export interface AccessRequestFormPayload {
  empId: number
  itsrNumber: string
  isAgreed: boolean
  details: AccessRequestFormDetail[]
}

export interface PendingApprovalQueueItem {
  id: number
  requestId: number
  detailId: number
  approvalId: number
  employeeName: string
  empId: number
  folderName: string
  accessType: AccessTypes
  status: AccessStatus
  reason?: string
  itsrNumber?: string
}

interface UserResponseDto {
  employeeId: number
  employeeCode: string
  name: string
  email: string
  departmentId: number
  departmentName: string
  role: string
}

interface SessionResponseDto {
  user: UserResponseDto
}

interface LoginResponseDto {
  accessToken: string
  session: SessionResponseDto
}

interface NotificationResponseDto {
  id: number
  requestId: number
  accessItemId?: number | null
  eventType: string
  message: string
  recipientStage: string
  createdAtUtc: string
  isRead: boolean
}

interface AuditResponseDto {
  id: number
  requestId: number
  accessItemId?: number | null
  stage: string
  eventType: string
  message: string
  actorEmployeeId?: number | null
  actorName?: string | null
  comments?: string | null
  happenedAtUtc: string
}

interface AccessItemResponseDto {
  accessItemId: number
  fileName: string
  folderPath: string
  accessType: string
  businessReason: string
  status: string
  resubmissionCount: number
  approvedUntilUtc?: string | null
  revokedAtUtc?: string | null
  rejectionReason?: string | null
  rejectedByStage?: string | null
  hodReviewerEmployeeId?: number | null
  hodReviewerName?: string | null
  hodReviewedAtUtc?: string | null
  hodNote?: string | null
  itReviewerEmployeeId?: number | null
  itReviewerName?: string | null
  itReviewedAtUtc?: string | null
  itNote?: string | null
}

interface RequestResponseDto {
  requestId: number
  parentRequestId?: number | null
  ticketNumber: string
  requestedByEmployeeId: number
  requestedByName: string
  departmentId: number
  departmentName: string
  aggregateStatus: string
  requestedAtUtc: string
  camundaBusinessKey?: string | null
  camundaProcessInstanceId?: string | null
  camundaLastAction?: string | null
  items: AccessItemResponseDto[]
  auditTrail: AuditResponseDto[]
}

interface DashboardCountsResponseDto {
  total: number
  pendingHod: number
  pendingUserResubmission: number
  pendingIt: number
  granted: number
  revoked: number
  expired: number
}

interface DashboardApprovalsResponseDto {
  hodInbox: number
  itInbox: number
}

interface DashboardResponseDto {
  currentUser: UserResponseDto
  counts: DashboardCountsResponseDto
  approvals: DashboardApprovalsResponseDto
  requests: RequestResponseDto[]
  notifications: NotificationResponseDto[]
}

export interface DashboardData {
  currentUser: User
  counts: DashboardCountsResponseDto
  approvals: DashboardApprovalsResponseDto
  requests: AccessRequest[]
  notifications: Notification[]
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "")

function getApiUrl(path: string) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("authToken")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

function normalizeRole(role: string): UserRole {
  switch (role) {
    case "Hod":
    case "HOD":
      return "HOD"
    case "ItTeam":
    case "IT":
      return "IT"
    default:
      return "User"
  }
}

function mapRequestStatus(status: string): AccessStatus {
  switch (status) {
    case "PendingHodApproval":
      return "PendingHOD"
    case "PendingItGrant":
      return "PendingIT"
    case "Granted":
      return "Approved"
    case "Revoked":
      return "Revoked"
    case "Expired":
      return "Expired"
    case "PendingUserResubmission":
      return "Rejected"
    default:
      return "PendingHOD"
  }
}

function mapAccessType(accessType: string): AccessTypes {
  const normalized = accessType.replace(/\s+/g, "").toLowerCase()

  if (normalized === "notapplicable") return "NotApplicable"
  if (normalized === "readonly" || normalized === "viewonly") return "ReadOnly"
  if (normalized === "readandwrite") return "ReadAndWrite"

  return "ReadOnly"
}

function mapAuditAction(eventType: string): AuditAction | null {
  switch (eventType) {
    case "request.created":
      return "RequestCreated"
    case "hod.approved":
      return "HODApproved"
    case "hod.rejected":
      return "HODRejected"
    case "it.approved":
      return "ITApproved"
    case "it.rejected":
      return "ITRejected"
    case "item.revoked":
      return "Revoked"
    case "item.expired":
      return "Expired"
    default:
      return null
  }
}

function mapNotificationType(eventType: string): Notification["type"] {
  switch (eventType) {
    case "hod.approved":
    case "it.approved":
      return "APPROVED"
    case "hod.rejected":
    case "it.rejected":
      return "REJECTED"
    case "item.expired":
      return "EXPIRED"
    default:
      return "PENDING_APPROVAL"
  }
}

function mapRecipientRole(stage: string): UserRole {
  switch (stage) {
    case "Hod":
      return "HOD"
    case "ItTeam":
      return "IT"
    default:
      return "User"
  }
}

export function mapApiUserToClient(user: UserResponseDto): User {
  return {
    id: user.employeeId,
    employeeId: user.employeeId,
    employeeCode: user.employeeCode,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
    departmentId: user.departmentId,
    department: user.departmentName,
  }
}

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch(getApiUrl("/api/auth/demo-users"), {
    headers: { "Content-Type": "application/json" },
  })

  const data = await parseJson<UserResponseDto[]>(response)
  return data.map(mapApiUserToClient)
}

function mapApprovalRecord(audit: AuditResponseDto): ApprovalRecord | null {
  const action = mapAuditAction(audit.eventType)
  const approverRole =
    audit.stage === "Hod" ? "HOD" : audit.stage === "ItTeam" ? "IT" : null

  if (!action || !approverRole || audit.actorEmployeeId == null) {
    return null
  }

  return {
    id: audit.id,
    approverRole,
    approverId: audit.actorEmployeeId,
    approverName: audit.actorName ?? approverRole,
    action,
    comment: audit.comments ?? undefined,
    timestamp: audit.happenedAtUtc,
    accessItemId: audit.accessItemId ?? undefined,
  }
}

function mapNotification(notification: NotificationResponseDto): Notification {
  return {
    id: notification.id,
    userId: 0,
    role: mapRecipientRole(notification.recipientStage),
    type: mapNotificationType(notification.eventType),
    requestid: notification.requestId,
    message: notification.message,
    read: notification.isRead,
    createdAt: notification.createdAtUtc,
  }
}

export function mapApiRequestToClient(
  request: RequestResponseDto,
  currentUser?: User | null
): AccessRequest {
  const approvalTimeline = request.auditTrail
    .map(mapApprovalRecord)
    .filter((record): record is ApprovalRecord => record !== null)
    .sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

  return {
    id: request.requestId,
    ticketNumber: request.ticketNumber,
    requesterId: request.requestedByEmployeeId,
    requesterName:
      currentUser?.employeeId === request.requestedByEmployeeId
        ? currentUser.name
        : request.requestedByName,
    requesterDept: request.departmentName,
    requestedAt: request.requestedAtUtc,
    items: request.items.map((item) => ({
      id: item.accessItemId,
      system: item.folderPath,
      accessType: mapAccessType(item.accessType),
      requestedAt: request.requestedAtUtc,
      expiresAt:
        item.approvedUntilUtc ??
        item.revokedAtUtc ??
        item.itReviewedAtUtc ??
        item.hodReviewedAtUtc ??
        request.requestedAtUtc,
      status: mapRequestStatus(item.status),
      reason: item.businessReason ?? undefined,
      approvalHistory: approvalTimeline.filter((record) =>
        request.auditTrail.some(
          (audit) => audit.id === record.id && audit.accessItemId === item.accessItemId
        )
      ),
    })),
    status: mapRequestStatus(request.aggregateStatus),
    rejectionReason:
      request.items.find((item) => item.rejectionReason)?.rejectionReason ?? undefined,
    approvalTimeline,
  }
}

function toPendingQueueItems(
  requests: RequestResponseDto[],
  role: UserRole
): PendingApprovalQueueItem[] {
  return requests.flatMap((request) =>
    request.items
      .filter((item) =>
        role === "HOD"
          ? item.status === "PendingHodApproval"
          : item.status === "PendingItGrant"
      )
      .map((item) => ({
        id: item.accessItemId,
        requestId: request.requestId,
        detailId: item.accessItemId,
        approvalId: item.accessItemId,
        employeeName: request.requestedByName,
        empId: request.requestedByEmployeeId,
        folderName: item.folderPath,
        accessType: mapAccessType(item.accessType),
        status: mapRequestStatus(item.status),
        reason: item.businessReason,
        itsrNumber: request.ticketNumber,
      }))
  )
}

function getFileName(folderName: string) {
  const normalized = folderName.trim().replace(/\/+$/, "")
  const parts = normalized.split(/[\\/]/).filter(Boolean)
  return parts.at(-1) ?? normalized
}

export async function loginWithEmployeeCode(
  employeeCode: string,
  password: string
): Promise<LoginResponseDto> {
  const response = await fetch(getApiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeCode, password }),
  })

  return parseJson<LoginResponseDto>(response)
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch(getApiUrl("/api/dashboard/me"), {
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
  })

  const data = await parseJson<DashboardResponseDto>(response)
  const currentUser = mapApiUserToClient(data.currentUser)

  return {
    currentUser,
    counts: data.counts,
    approvals: data.approvals,
    requests: data.requests.map((request) => mapApiRequestToClient(request, currentUser)),
    notifications: data.notifications.map(mapNotification),
  }
}

export async function fetchAccessRequestsByUser(
  _empId: number,
  currentUser?: User | null
): Promise<AccessRequest[]> {
  const response = await fetch(getApiUrl("/api/requests/me"), {
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
  })

  const data = await parseJson<RequestResponseDto[]>(response)
  return data.map((request) => mapApiRequestToClient(request, currentUser))
}

export async function fetchHodPendingApprovals(): Promise<PendingApprovalQueueItem[]> {
  const response = await fetch(getApiUrl("/api/requests/me"), {
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
  })

  const data = await parseJson<RequestResponseDto[]>(response)
  return toPendingQueueItems(data, "HOD")
}

export async function fetchItPendingApprovals(): Promise<PendingApprovalQueueItem[]> {
  const response = await fetch(getApiUrl("/api/requests/me"), {
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
  })

  const data = await parseJson<RequestResponseDto[]>(response)
  return toPendingQueueItems(data, "IT")
}

export async function updateAccessApproval(params: {
  requestId: number
  detailId: number
  approvalId?: number
  approverEmpId?: number
  approvalLevel: "HOD" | "IT"
  status: "Approved" | "Rejected"
  comments?: string
  approvedType?: string
  durationDays?: number
}) {
  const path =
    params.approvalLevel === "HOD"
      ? `/api/requests/${params.requestId}/items/${params.detailId}/hod-review`
      : `/api/requests/${params.requestId}/items/${params.detailId}/it-review`

  const body: Record<string, unknown> = {
    approved: params.status === "Approved",
    note: params.comments ?? "",
  }

  if (params.approvedType) {
    body.approvedType = params.approvedType
  }

  if (typeof params.durationDays === "number") {
    body.durationDays = params.durationDays
  }

  const response = await fetch(getApiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(body),
  })

  return parseJson<RequestResponseDto>(response)
}

export async function createAccessRequest(
  payload: AccessRequestFormPayload,
  currentUser?: User | null
): Promise<AccessRequest> {
  const response = await fetch(getApiUrl("/api/requests/"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({
      items: payload.details.map((detail) => ({
        fileName: getFileName(detail.folderName),
        folderPath: detail.folderName,
        accessType: detail.accessType,
        businessReason: detail.reason,
      })),
    }),
  })

  const data = await parseJson<RequestResponseDto>(response)
  return mapApiRequestToClient(data, currentUser)
}

export async function revokeAccessItem(
  requestId: number,
  itemId: number,
  note?: string
): Promise<AccessRequest> {
  const response = await fetch(
    getApiUrl(`/api/requests/${requestId}/items/${itemId}/revoke`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ note: note ?? "" }),
    }
  )

  const data = await parseJson<RequestResponseDto>(response)
  return mapApiRequestToClient(data)
}

/**
 * Send notification to requester about approval/rejection
 * The backend typically creates these automatically, but this ensures they're sent
 */
export async function sendNotificationToRequester(
  requestId: number,
  itemId: number,
  eventType: "approved" | "rejected",
  stage: "HOD" | "IT",
  message: string
): Promise<void> {
  try {
    const response = await fetch(
      getApiUrl(`/api/notifications/send`),
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          requestId,
          itemId,
          eventType,
          stage,
          message,
        }),
      }
    )

    if (!response.ok) {
      console.warn("Failed to send notification:", response.statusText)
    }
  } catch (error) {
    console.warn("Error sending notification:", error)
    // Don't throw - notifications are secondary to the main approval/rejection flow
  }
}

export async function getAllRequests(): Promise<AccessRequest[]> {
  const response = await fetch(getApiUrl("/api/requests"), {
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
  })

  const data = await parseJson<RequestResponseDto[]>(response)
  return data.map((request) => mapApiRequestToClient(request))
}
