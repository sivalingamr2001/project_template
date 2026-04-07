import { daysBetween } from "@/lib/utils"
import type { AccessRequest } from "@/lib/types"

export function getNextPendingItemId(
  request: AccessRequest,
  currentRole: string | null,
  currentItemId: number
) {
  const pendingStatus = currentRole === "HOD" ? "PendingHOD" : "PendingIT"
  const currentIndex = request.items.findIndex((item) => item.id === currentItemId)
  const nextItemAfterCurrent = request.items.slice(currentIndex + 1).find((item) => item.status === pendingStatus)
  if (nextItemAfterCurrent) return nextItemAfterCurrent.id
  return request.items.find((item) => item.status === pendingStatus)?.id
}

export function getDisplayDurations(request: AccessRequest, tempDurations: Record<number, number>) {
  return Object.fromEntries(
    request.items.map((item) => [
      item.id,
      tempDurations[item.id] ?? Math.max(1, daysBetween(request.requestedAt, item.expiresAt)),
    ])
  )
}

