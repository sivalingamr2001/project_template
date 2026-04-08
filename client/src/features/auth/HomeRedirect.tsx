import { Navigate } from "react-router-dom"

import { useAuth } from "@/context/AuthContext"
import { getDefaultRoute } from "@/features/access-workspace/utils/accessSelectors"

function HomeRedirect() {
  const { user } = useAuth()
  const role =
    user?.role === "Hod" || user?.role === "ItTeam" ? user.role : "User"

  return <Navigate to={getDefaultRoute(role)} replace />
}

export default HomeRedirect
