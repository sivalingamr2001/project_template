import { useData } from "../../context/DataContext"

export const useActiveAccess = () => {
  const { requests } = useData()

  const data = requests.flatMap((request) =>
    request.items
      .filter((item) => item.status === "Approved")
      .map((item) => ({
        id: item.id,
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
