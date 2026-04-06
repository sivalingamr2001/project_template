import type { AccessRequest } from "./types"
import { WorkflowEngine } from "./workflow-engine"

export function processExpirations(requests: AccessRequest[]): AccessRequest[] {
  return requests.map((request) => ({
    ...request,
    items: request.items.map((item) => WorkflowEngine.checkAndMarkExpired(item)),
  }))
}

export function getExpiringItemsAcrossRequests(
  requests: AccessRequest[],
  withinDays: number = 30
): Array<{ requestId: number; requestName: string; item: unknown }> {
  const expiringItems: Array<{ requestId: number; requestName: string; item: unknown }> = []

  requests.forEach((request) => {
    request.items.forEach((item) => {
      if (item.status === "Approved") {
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiresAt).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )

        if (daysUntilExpiry > 0 && daysUntilExpiry <= withinDays) {
          expiringItems.push({
            requestId: request.id,
            requestName: request.requesterName,
            item: { ...item, daysUntilExpiry },
          })
        }
      }
    })
  })

  return expiringItems
}

export function getItemsExpiringToday(requests: AccessRequest[]): number {
  const today = new Date().toDateString()
  return requests.reduce(
    (count, request) =>
      count +
      request.items.filter(
        (item) =>
          item.status === "Approved" &&
          new Date(item.expiresAt).toDateString() === today
      ).length,
    0
  )
}

export function revokeAccessItem(request: AccessRequest, itemId: number): AccessRequest {
  return {
    ...request,
    items: request.items.map((item) =>
      item.id === itemId ? { ...item, status: "Revoked" as const } : item
    ),
  }
}

export function extendAccessItem(
  request: AccessRequest,
  itemId: number,
  daysToAdd: number
): AccessRequest {
  return {
    ...request,
    items: request.items.map((item) => {
      if (item.id === itemId && item.status === "Approved") {
        const newExpiryDate = new Date(item.expiresAt)
        newExpiryDate.setDate(newExpiryDate.getDate() + daysToAdd)
        return { ...item, expiresAt: newExpiryDate.toISOString() }
      }
      return item
    }),
  }
}

export function getExpiryAnalytics(requests: AccessRequest[]) {
  let totalActive = 0
  let expiringWithin30 = 0
  let expiredCount = 0
  let revokedCount = 0

  requests.forEach((request) => {
    request.items.forEach((item) => {
      if (item.status === "Approved") {
        totalActive++
        if (WorkflowEngine.isExpiringWithin30Days(item)) {
          expiringWithin30++
        }
      } else if (item.status === "Expired") {
        expiredCount++
      } else if (item.status === "Revoked") {
        revokedCount++
      }
    })
  })

  return {
    totalActive,
    expiringWithin30,
    expiredCount,
    revokedCount,
  }
}
