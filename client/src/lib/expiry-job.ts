import type { AccessRequest } from "./types"
import { WorkflowEngine } from "./workflow-engine"

/**
 * Expiry Job - Handles 365-day auto-expiration and revocation logic
 * Runs on app load and periodically during session
 */

/**
 * Process all requests and mark expired items
 */
export function processExpirations(requests: AccessRequest[]): AccessRequest[] {
  return requests.map((request) => ({
    ...request,
    items: request.items.map((item) =>
      WorkflowEngine.checkAndMarkExpired(item)
    ),
  }))
}

/**
 * Get all active items that are expiring within N days
 */
export function getExpiringItemsAcrossRequests(
  requests: AccessRequest[],
  withinDays: number = 30
): Array<{ requestId: number; requestName: string; item: unknown }> {
  const expiringItems: Array<{
    requestId: number
    requestName: string
    item: unknown
  }> = []

  requests.forEach((request) => {
    request.items.forEach((item) => {
      if (item.status === "ACTIVE") {
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

/**
 * Get count of items expiring today
 */
export function getItemsExpiringToday(requests: AccessRequest[]): number {
  const today = new Date().toDateString()
  return requests.reduce((count, request) => {
    return (
      count +
      request.items.filter(
        (item) =>
          item.status === "ACTIVE" &&
          new Date(item.expiresAt).toDateString() === today
      ).length
    )
  }, 0)
}

/**
 * Revoke an access item
 */
export function revokeAccessItem(
  request: AccessRequest,
  itemId: number
): AccessRequest {
  return {
    ...request,
    items: request.items.map((item) =>
      item.id === itemId ? { ...item, status: "Revoked" as const } : item
    ),
  }
}

/**
 * Extend access for an item by N days
 */
export function extendAccessItem(
  request: AccessRequest,
  itemId: number,
  daysToAdd: number
): AccessRequest {
  return {
    ...request,
    items: request.items.map((item) => {
      if (item.id === itemId && item.status === "ACTIVE") {
        const newExpiryDate = new Date(item.expiresAt)
        newExpiryDate.setDate(newExpiryDate.getDate() + daysToAdd)
        return { ...item, expiresAt: newExpiryDate.toISOString() }
      }
      return item
    }),
  }
}

/**
 * Get analytics: count of items by expiry status
 */
export function getExpiryAnalytics(requests: AccessRequest[]) {
  let totalActive = 0
  let expiringWithin30 = 0
  let expiredCount = 0
  let revokedCount = 0

  requests.forEach((request) => {
    request.items.forEach((item) => {
      if (item.status === "ACTIVE") {
        totalActive++
        if (WorkflowEngine.isExpiringWithin30Days(item)) {
          expiringWithin30++
        }
      } else if (item.status === "EXPIRED") {
        expiredCount++
      } else if (item.status === "REVOKED") {
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
