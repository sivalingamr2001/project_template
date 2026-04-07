import { Navigate, Route, Routes } from "react-router-dom"
import { useApp } from "@/context/AppContext"
import { RequestDetails } from "@/components/employee/RequestDetails"
import { HODDashboard } from "@/components/hod"
import { ITDashboard } from "@/components/it"
import { EmployeeDashboard } from "@/pages/EmployeeDashboard"
import { NotFound } from "@/pages/NotFound"
import { UserProfile } from "@/pages/UserProfile"
import { getDefaultPathForRole, ROUTES } from "./constants"

function DefaultRouteRedirect() {
  const { currentRole } = useApp()
  return <Navigate to={getDefaultPathForRole(currentRole)} replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.root} element={<DefaultRouteRedirect />} />

      <Route path={ROUTES.dashboard} element={<EmployeeDashboard />} />
      <Route path={ROUTES.myRequests} element={<EmployeeDashboard />} />
      <Route path={ROUTES.requestDetailBase} element={<RequestDetails />} />
      <Route path={ROUTES.requestDetail} element={<RequestDetails />} />
      <Route path={ROUTES.profile} element={<UserProfile />} />

      <Route path={ROUTES.hodApprovals} element={<HODDashboard />} />
      <Route path={ROUTES.hodHistory} element={<HODDashboard />} />
      <Route path={ROUTES.hodLookup} element={<HODDashboard />} />
      <Route path={ROUTES.hodAllRequests} element={<HODDashboard />} />

      <Route path={ROUTES.itQueue} element={<ITDashboard />} />
      <Route path={ROUTES.itActiveAccess} element={<ITDashboard />} />
      <Route path={ROUTES.itLookup} element={<ITDashboard />} />
      <Route path={ROUTES.itAuditLog} element={<ITDashboard />} />
      <Route path={ROUTES.itAllRequests} element={<ITDashboard />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
