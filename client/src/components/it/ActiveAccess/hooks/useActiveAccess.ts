import { useData } from "@/context/DataContext"
import type { ActiveAccessItem } from "../../types"

export function useActiveAccess(): { data: ActiveAccessItem[]; isLoading: boolean } {
  const { requests } = useData()

  const data = requests.flatMap((request) =>
    request.items
      .filter((item) => item.status === "Approved")
      .map((item) => ({
        id: item.id,
        requestId: request.id,
        employeeName: request.requesterName,
        empId: request.requesterId,
        folderName: item.system,
        accessType: item.accessType,
        status: item.status,
        expiresAt: item.expiresAt,
      }))
  )

  return { data, isLoading: false }
}
