import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/context/AuthContext"
import { getDefaultRoute } from "@/features/access-workspace/utils/accessSelectors"

import type { AppRole } from "@/features/access-workspace/types"

type RoleRouteProps = {
  allowedRoles: AppRole[]
}

function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuth()
  const role =
    user?.role === "Hod" || user?.role === "ItTeam" ? user.role : "User"

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getDefaultRoute(role)} replace />
  }

  return <Outlet />
}

export default RoleRoute
