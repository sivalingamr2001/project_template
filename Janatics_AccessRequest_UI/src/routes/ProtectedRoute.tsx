import { useAuth } from "@/providers/auth-provider"
import { Navigate } from "react-router-dom"
export default function ProtectedRoute({ children }: { children: any }) {

  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}