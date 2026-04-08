import { useAuth } from "@/context/AuthContext"

export function useApp() {
  const { user } = useAuth()
  const currentRole =
    user?.role === "Hod" || user?.role === "ItTeam" ? user.role : "User"

  return {
    currentRole,
    currentUser: user,
  }
}
