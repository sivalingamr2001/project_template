import { useData } from "@/context/DataContext"
import { getExpiringItemsAcrossRequests } from "@/lib/expiry-job"
import type { ITStatsData } from "../../types"

export function useITStats(): ITStatsData {
  const { requests } = useData()

  const queue = requests
    .flatMap((request) => request.items)
    .filter((item) => item.status === "PendingIT").length

  const active = requests
    .flatMap((request) => request.items)
    .filter((item) => item.status === "Approved").length

  const expiringSoon = getExpiringItemsAcrossRequests(requests).length

  return { queue, active, expiringSoon }
}
