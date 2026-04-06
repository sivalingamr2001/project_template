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
        requesterEmail: undefined,
        requesterCode: undefined,
        department: request.requesterDept,
        hodName: undefined,
        hodEmail: undefined,
        requestedAt: item.requestedAt,
        approvedBy: item.approvalHistory.find((entry) => entry.action === "HODApproved")?.approverName,
        itApprovedBy: item.approvalHistory.find((entry) => entry.action === "ITApproved")?.approverName,
        requestId: request.id,
        detailId: item.id,
        approvalId: item.id,
      }))
  )

  return { data, isLoading: false }
}
