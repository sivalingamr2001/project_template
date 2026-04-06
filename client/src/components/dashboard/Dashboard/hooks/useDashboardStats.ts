import { useData } from "@/context/DataContext"
import { useApp } from "@/hooks/useApp"

export interface DashboardStats {
  pendingApprovals: number
  approvedToday: number
  expiringWithin30Days: number
  revokedAccess: number
}

export function useDashboardStats(): DashboardStats {
  const { requests } = useData()
  const { currentRole } = useApp()

  const getPendingCount = () => {
    if (currentRole === "HOD") {
      return requests.filter((request) =>
        request.items.some((item) => item.status === "PendingHOD")
      ).length
    }
    if (currentRole === "IT") {
      return requests.filter((request) =>
        request.items.some((item) => item.status === "PendingIT")
      ).length
    }
    return 0
  }

  const getApprovedTodayCount = () => {
    const today = new Date().toDateString()
    return requests.filter((request) =>
      request.approvalTimeline.some(
        (entry) =>
          new Date(entry.timestamp).toDateString() === today &&
          ["HODApproved", "ITApproved"].includes(entry.action)
      )
    ).length
  }

  const getExpiringCount = () =>
    requests.flatMap((request) => request.items).filter((item) => {
      if (item.status !== "Approved") return false
      const daysLeft = Math.ceil(
        (new Date(item.expiresAt).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
      return daysLeft > 0 && daysLeft <= 30
    }).length

  const getRevokedCount = () =>
    requests.flatMap((request) => request.items).filter((item) => item.status === "Revoked")
      .length

  return {
    pendingApprovals: getPendingCount(),
    approvedToday: getApprovedTodayCount(),
    expiringWithin30Days: getExpiringCount(),
    revokedAccess: getRevokedCount(),
  }
}
