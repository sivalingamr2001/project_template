import type {
  AccessRequest,
  AccessRequestApproval,
  AccessRequestDetails,
  AccessRequestItem,
  AggregateStatus,
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

export async function reviewAccessRequestByHod(
  accessReqId: number,
  reviewerEmployeeId: number,
  approved: boolean,
  comments: string
) {
  const response = await fetch(
    `${API_URL}/access-requests/${accessReqId}/hod-review`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewerEmployeeId, approved, comments }),
    }
  )
  if (!response.ok) throw new Error("Unable to complete HOD review.")
}

export async function reviewAccessRequestByIt(
  accessReqId: number,
  reviewerEmployeeId: number,
  approved: boolean,
  comments: string,
  itsrNo: string
) {
  const response = await fetch(
    `${API_URL}/access-requests/${accessReqId}/it-review`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewerEmployeeId, approved, comments, itsrNo }),
    }
  )
  if (!response.ok) throw new Error("Unable to complete IT review.")
}
