import type { AccessRequest, AccessItem, AccessItemStatus } from "./types"

export class WorkflowEngine {
  static calculateRequestStatus(request: AccessRequest): AccessItemStatus {
    const statuses = request.items.map((item) => item.status)

    if (statuses.includes("Rejected")) return "Rejected"
    if (statuses.includes("PendingHOD")) return "PendingHOD"
    if (statuses.includes("PendingIT")) return "PendingIT"
    if (statuses.every((status) => status === "Revoked")) return "Revoked"
    if (statuses.every((status) => status === "Expired")) return "Expired"
    return "Approved"
  }

  static checkAndMarkExpired(item: AccessItem): AccessItem {
    if (item.status === "Approved" && new Date(item.expiresAt) < new Date()) {
      return { ...item, status: "Expired" }
    }
    return item
  }

  static isExpiringWithin30Days(item: AccessItem): boolean {
    if (item.status !== "Approved") return false
    const daysUntilExpiry = Math.ceil(
      (new Date(item.expiresAt).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30
  }
}
