import type { AccessRequest, AppRole, QueueMode, SummaryCard } from "../types"

const numberFormatter = new Intl.NumberFormat("en-US")

function expandRequestsByItem(requests: AccessRequest[]) {
  return requests.flatMap((request) => {
    if (request.accessItems.length === 0) {
      return [request]
    }

    return request.accessItems.map((accessItem) => ({
      ...request,
      accessItems: [accessItem],
    }))
  })
}

export function getRequestsByMode(
  requests: AccessRequest[],
  mode: QueueMode,
  employeeId: number
) {
  if (mode === "dashboard")
    return expandRequestsByItem(
      requests.filter((request) => request.empId === employeeId)
    )
  if (mode === "hodPending")
    return expandRequestsByItem(
      requests.filter((request) => request.status === "Pending HOD")
    )
  if (mode === "hodHistory")
    return expandRequestsByItem(
      requests.filter(
        (request) =>
          request.status.includes("HOD") && request.status !== "Pending HOD"
      )
    )
  if (mode === "hodAll") return expandRequestsByItem(requests)
  if (mode === "itQueue")
    return expandRequestsByItem(
      requests.filter((request) => request.status === "Pending IT")
    )
  if (mode === "itActive")
    return expandRequestsByItem(
      requests.filter(
        (request) =>
          request.status === "Access Granted" ||
          request.aggregateStatus === "Approved"
      )
    )
  return expandRequestsByItem(requests)
}

export function getSummaryCards(
  requests: AccessRequest[],
  employeeId: number
): SummaryCard[] {
  const userRequests = requests.filter(
    (request) => request.empId === employeeId
  )
  return [
    {
      label: "Total Requests",
      value: numberFormatter.format(userRequests.length),
      detail: "Across active access workflows",
    },
    {
      label: "Pending Reviews",
      value: numberFormatter.format(
        userRequests.filter((request) => request.aggregateStatus === "Pending")
          .length
      ),
      detail: "Waiting on HOD or IT",
    },
    {
      label: "Provisioned",
      value: numberFormatter.format(
        userRequests.filter((request) => request.status === "Access Granted")
          .length
      ),
      detail: "Access granted and logged",
    },
    {
      label: "Attention",
      value: numberFormatter.format(
        userRequests.filter((request) => request.aggregateStatus === "Rejected")
          .length
      ),
      detail: "Rejected or revoke action",
    },
  ]
}

export function getDefaultRoute(role: AppRole) {
  if (role === "Hod") return "/hod/pending-approvals"
  if (role === "ItTeam") return "/it/approval-queue"
  return "/dashboard"
}
