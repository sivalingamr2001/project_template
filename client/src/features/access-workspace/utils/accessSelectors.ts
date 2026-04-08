import type { AccessRequest, AppRole, QueueMode, SummaryCard } from "../types"

const numberFormatter = new Intl.NumberFormat("en-US")

export function getRequestsByMode(
  requests: AccessRequest[],
  mode: QueueMode,
  employeeId: number
) {
  if (mode === "dashboard")
    return requests.filter((request) => request.empId === employeeId)
  if (mode === "hodPending")
    return requests.filter((request) => request.status === "Pending HOD")
  if (mode === "hodHistory")
    return requests.filter(
      (request) =>
        request.status.includes("HOD") && request.status !== "Pending HOD"
    )
  if (mode === "hodAll") return requests
  if (mode === "itQueue")
    return requests.filter((request) => request.status === "Pending IT")
  if (mode === "itActive")
    return requests.filter(
      (request) =>
        request.status === "Access Granted" ||
        request.aggregateStatus === "Approved"
    )
  return requests
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
