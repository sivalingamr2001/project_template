import type { Page } from "@/context/AppContext"
import type { User, UserRole } from "@/lib/types"
import { createContext, useContext } from "react"

interface AppContextType {
  currentUser: User | null
  currentRole: UserRole | null
  currentPage: Page
  isAuthenticated: boolean
  selectedRequestId?: number
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setCurrentPage: (page: Page) => void
  setSelectedRequestId: (id?: number) => void
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
