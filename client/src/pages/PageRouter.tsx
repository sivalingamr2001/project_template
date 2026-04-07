import { useApp } from "@/context/AppContext"
import { RequestDetails } from "../components/employee/RequestDetails"
import { HODDashboard } from "../components/hod"
import { ITDashboard } from "../components/it"
import { EmployeeDashboard } from "./EmployeeDashboard"
import { UserProfile } from "./UserProfile"

export function PageRouter() {
  const { currentPage, currentRole, selectedRequestId } = useApp()

  if (currentRole === "User") {
    switch (currentPage) {
      case "EMPLOYEE_DASHBOARD":
      case "EMPLOYEE_REQUESTS":
        return <EmployeeDashboard />
      case "EMPLOYEE_REQUEST_DETAIL":
        return <RequestDetails />
      case "USER_PROFILE":
        return <UserProfile />
      default:
        return <EmployeeDashboard />
    }
  }

  if (currentRole === "HOD") {
    switch (currentPage) {
      case "HOD_APPROVALS":
      case "HOD_HISTORY":
      case "HOD_LOOKUP":
      case "HOD_ALL_REQUESTS":
        return <HODDashboard />
      case "EMPLOYEE_REQUEST_DETAIL":
        return <RequestDetails key={selectedRequestId ?? "hod-request-detail"} />
      case "USER_PROFILE":
        return <UserProfile />
      default:
        return <HODDashboard />
    }
  }

  if (currentRole === "IT") {
    switch (currentPage) {
      case "IT_QUEUE":
      case "IT_ACTIVE_ACCESS":
      case "IT_LOOKUP":
      case "IT_AUDIT_LOG":
      case "IT_ALL_REQUESTS":
        return <ITDashboard />
      case "EMPLOYEE_REQUEST_DETAIL":
        return <RequestDetails key={selectedRequestId ?? "it-request-detail"} />
      case "USER_PROFILE":
        return <UserProfile />
      default:
        return <ITDashboard />
    }
  }

  return <EmployeeDashboard />
}
