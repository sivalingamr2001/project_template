import type {
  AccessRequest,
  AccessStatus,
  AccessTypes,
  ApprovalRecord,
  AuditAction,
  User,
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

interface AccessApprovalResponseDto {
  id: number
  accessDetailId: number
  approverEmpId: number
  approvalLevel: "HOD" | "IT"
  status: string
  comments?: string | null
  createdOn: string
  createdBy: string
  modifiedOn: string
  modifiedBy: string
}

interface AccessDetailResponseDto {
  id: number
  accessRequestId: number
  folderPath: string
  accessType: string
  reason?: string | null
  status: string
  expiredAt?: string | null
  isActive: boolean
  createdOn: string
  createdBy: string
  modifiedOn: string
  modifiedBy: string
  approvals: AccessApprovalResponseDto[]
}

interface AccessRequestResponseDto {
  id: number
  empId: number
  status: string
  isAgreed: boolean
  isRevoke: boolean
  isActive: boolean
  itsrNumber?: string | null
  createdOn: string
  createdBy: string
  modifiedOn: string
  modifiedBy: string
  details: AccessDetailResponseDto[]
}

interface PendingApprovalQueueItemDto {
  requestId: number
  detailId: number
  approvalId: number
  requestEmpId: number
  approverEmpId: number
  approvalLevel: "HOD" | "IT"
  requestStatus: string
  detailStatus: string
  approvalStatus: string
  folderPath: string
  accessType: string
  reason?: string | null
  expiredAt?: string | null
  itsrNumber?: string | null
  requestCreatedOn: string
  comments?: string | null
}

const API_BASE_URL = "https://localhost:7229"

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("authToken")
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}
}

function mapRequestStatus(status: string): AccessStatus {
  switch (status) {
    case "Pending":
    case "PendingHOD":
      return "PendingHOD"
    case "PendingIT":
      return "PendingIT"
    case "Approved":
      return "Approved"
    case "Rejected":
      return "Rejected"
    case "Expired":
      return "Expired"
    case "Revoked":
      return "Revoked"
    default:
      return "PendingHOD"
  }
}

function mapAccessType(accessType: string): AccessTypes {
  const normalized = accessType.replace(/\s+/g, "").toLowerCase()

  if (normalized === "notapplicable") return "NotApplicable"
  if (normalized === "readonly") return "ReadOnly"
  if (normalized === "readandwrite") return "ReadAndWrite"

  return "ReadOnly"
}

function mapAuditAction(
  approvalLevel: "HOD" | "IT",
  status: string
): AuditAction | null {
  if (approvalLevel === "HOD" && status === "Approved") return "HODApproved"
  if (approvalLevel === "HOD" && status === "Rejected") return "HODRejected"
  if (approvalLevel === "IT" && status === "Approved") return "ITApproved"
  if (approvalLevel === "IT" && status === "Rejected") return "ITRejected"
  return null
}

function mapApprovalRecord(
  approval: AccessApprovalResponseDto
): ApprovalRecord | null {
  const action = mapAuditAction(approval.approvalLevel, approval.status)

  if (!action) return null

  return {
    id: approval.id,
    approverRole: approval.approvalLevel,
    approverId: approval.approverEmpId,
    approverName: approval.modifiedBy || approval.createdBy || `${approval.approvalLevel} Approver`,
    action,
    comment: approval.comments ?? undefined,
    timestamp: approval.modifiedOn || approval.createdOn,
  }
}

export function mapApiRequestToClient(
  request: AccessRequestResponseDto,
  currentUser?: User | null
): AccessRequest {
  const detailApprovalRecords = request.details.flatMap((detail) =>
    detail.approvals
      .map(mapApprovalRecord)
      .filter((record): record is ApprovalRecord => record !== null)
  )

  return {
    id: request.id,
    requesterId: request.empId,
    requesterName:
      currentUser?.employeeId === request.empId || currentUser?.id === request.empId
        ? currentUser.name
        : `Employee ${request.empId}`,
    requesterDept:
      currentUser?.employeeId === request.empId || currentUser?.id === request.empId
        ? currentUser.department || "Unknown"
        : "Unknown",
    requestedAt: request.createdOn,
    items: request.details.map((detail) => ({
      id: detail.id,
      system: detail.folderPath,
      accessType: mapAccessType(detail.accessType),
      requestedAt: detail.createdOn,
      expiresAt: detail.expiredAt ?? detail.modifiedOn ?? detail.createdOn,
      status: mapRequestStatus(detail.status),
      approvalHistory: detail.approvals
        .map(mapApprovalRecord)
        .filter((record): record is ApprovalRecord => record !== null),
    })),
    status: mapRequestStatus(request.status),
    rejectionReason:
      request.details.find((detail) => detail.status === "Rejected")?.reason ?? undefined,
    approvalTimeline: detailApprovalRecords.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ),
  }
}

export async function fetchAccessRequestsByUser(
  empId: number,
  currentUser?: User | null
): Promise<AccessRequest[]> {
  const response = await fetch(`${API_BASE_URL}/access-requests/by-user/${empId}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch access requests: ${response.status}`)
  }

  const data: AccessRequestResponseDto[] = await response.json()
  return data.map((request) => mapApiRequestToClient(request, currentUser))
}

function mapQueueItem(dto: PendingApprovalQueueItemDto): PendingApprovalQueueItem {
  return {
    id: dto.approvalId,
    requestId: dto.requestId,
    detailId: dto.detailId,
    approvalId: dto.approvalId,
    employeeName: `Employee ${dto.requestEmpId}`,
    empId: dto.requestEmpId,
    folderName: dto.folderPath,
    accessType: mapAccessType(dto.accessType),
    status: mapRequestStatus(dto.approvalStatus),
    reason: dto.reason ?? undefined,
    itsrNumber: dto.itsrNumber ?? undefined,
  }
}

export async function fetchHodPendingApprovals(
  hodId: number
): Promise<PendingApprovalQueueItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/access-requests/hod/${hodId}/pending`,
    {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch HOD approvals: ${response.status}`)
  }

  const data: PendingApprovalQueueItemDto[] = await response.json()
  return data.map(mapQueueItem)
}

export async function fetchItPendingApprovals(
  infraEmpId: number
): Promise<PendingApprovalQueueItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/access-requests/infra/${infraEmpId}/pending`,
    {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch IT approvals: ${response.status}`)
  }

  const data: PendingApprovalQueueItemDto[] = await response.json()
  return data.map(mapQueueItem)
}

export async function updateAccessApproval(params: {
  requestId: number
  detailId: number
  approvalId: number
  approverEmpId: number
  approvalLevel: "HOD" | "IT"
  status: "Approved" | "Rejected"
  comments?: string
}) {
  const response = await fetch(
    `${API_BASE_URL}/access-requests/${params.requestId}/details/${params.detailId}/approvals/${params.approvalId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        approverEmpId: params.approverEmpId,
        approvalLevel: params.approvalLevel,
        status: params.status,
        comments: params.comments ?? "",
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Failed to update approval: ${response.status}`)
  }

  return response.json()
}

export async function createAccessRequest(
  payload: AccessRequestFormPayload,
  currentUser?: User | null
): Promise<AccessRequest> {
  const requestBody = {
    empId: payload.empId,
    itsrNumber: payload.itsrNumber,
    isAgreed: payload.isAgreed,
    isRevoke: false,
    details: payload.details.map((detail) => ({
      folderPath: detail.folderName,
      accessType: detail.accessType,
      reason: detail.reason,
      expiredAt: new Date(
        Date.now() + detail.durationDays * 24 * 60 * 60 * 1000
      ).toISOString(),
    })),
  }

  const response = await fetch(`${API_BASE_URL}/access-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      errorText || `Failed to create access request: ${response.status}`
    )
  }

  const data: AccessRequestResponseDto = await response.json()
  return mapApiRequestToClient(data, currentUser)
}
