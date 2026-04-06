import { useData } from "../../context/DataContext"

export const useApprovalHistory = () => {
  const { requests } = useData()

  const data = requests.flatMap((request) =>
    request.items
      .filter((item) => item.status !== "PendingHOD")
      .map((item) => ({
        id: item.id,
        employeeName: request.requesterName,
        empId: request.requesterId,
        folderName: item.system,
        accessType: item.accessType,
        status: item.status,
      }))
  )

  return { data, isLoading: false }
}
