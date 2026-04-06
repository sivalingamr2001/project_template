import type { AccessItem, AccessRequest } from "./types"
import { WorkflowEngine } from "./workflow-engine"

export function getRequestStatus(request: AccessRequest) {
  return WorkflowEngine.calculateRequestStatus(request)
}

export function getAccessItemStatus(item: AccessItem) {
  return WorkflowEngine.checkAndMarkExpired({ ...item }).status
}

export function isRequestExpiringWithin30Days(request: AccessRequest) {
  return request.items.some((item) => WorkflowEngine.isExpiringWithin30Days(item))
}

export function getExpiringItems(request: AccessRequest) {
  return request.items.filter((item) => WorkflowEngine.isExpiringWithin30Days(item))
}

export function getDaysUntilExpiry(item: AccessItem) {
  const daysUntilExpiry = Math.ceil(
    (new Date(item.expiresAt).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )
  return Math.max(0, daysUntilExpiry)
}

export function isItemActive(item: AccessItem) {
  return getAccessItemStatus(item) === "Approved"
}

export function isItemExpired(item: AccessItem) {
  return getAccessItemStatus(item) === "Expired"
}

export function canEditRequest(request: AccessRequest) {
  return getRequestStatus(request) === "PendingHOD"
}

export function getApprovalProgress(request: AccessRequest) {
  const total = request.items.length
  const approved = request.items.filter((item) => item.status === "Approved").length
  return total === 0 ? 0 : Math.round((approved / total) * 100)
}

export function needsHodApproval(request: AccessRequest) {
  return request.items.some((item) => item.status === "PendingHOD")
}

export function needsITApproval(request: AccessRequest) {
  return request.items.some((item) => item.status === "PendingIT")
}

export function getStatusSummary(request: AccessRequest) {
  const total = request.items.length
  const pendingHod = request.items.filter((item) => item.status === "PendingHOD").length
  const pendingIt = request.items.filter((item) => item.status === "PendingIT").length
  const approved = request.items.filter((item) => item.status === "Approved").length

  if (pendingHod > 0) return `Pending HOD approval: ${pendingHod}/${total} items`
  if (pendingIt > 0) return `Pending IT approval: ${pendingIt}/${total} items`
  if (approved > 0) return `Approved access: ${approved}/${total} items`
  return `No active items`
}
