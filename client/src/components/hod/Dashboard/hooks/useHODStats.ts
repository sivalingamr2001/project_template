import { useData } from "@/context/DataContext"
import type { HODStatsData } from "../types"

export function useHODStats(): HODStatsData {
  const { requests } = useData()
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const pendingCount = requests
    .flatMap((request) => request.items)
    .filter((item) => item.status === "PendingHOD").length

  const approvedMonth = requests
    .flatMap((request) => request.approvalTimeline)
    .filter((entry) => {
      const date = new Date(entry.timestamp)
      return (
        entry.action === "HODApproved" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      )
    }).length

  const rejectedMonth = requests
    .flatMap((request) => request.approvalTimeline)
    .filter((entry) => {
      const date = new Date(entry.timestamp)
      return (
        entry.action === "HODRejected" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      )
    }).length

  return { pendingCount, approvedMonth, rejectedMonth }
}
