import type { User, UserRole } from "@/lib/types"

export type Page =
  | "LOGIN"
  | "EMPLOYEE_DASHBOARD"
  | "EMPLOYEE_REQUESTS"
  | "EMPLOYEE_REQUEST_DETAIL"
  | "USER_PROFILE"
  | "HOD_APPROVALS"
  | "HOD_HISTORY"
  | "HOD_LOOKUP"
  | "HOD_ALL_REQUESTS"
  | "IT_QUEUE"
  | "IT_ACTIVE_ACCESS"
  | "IT_LOOKUP"
  | "IT_AUDIT_LOG"
  | "IT_ALL_REQUESTS"

export interface AppContextType {
  currentUser: User | null
  currentRole: UserRole | null
  currentPage: Page
  isAuthenticated: boolean
  selectedRequestId?: number
  selectedAccessItemId?: number
  login: (employeeCode: string, password: string) => Promise<boolean>
  logout: () => void
  setCurrentPage: (page: Page) => void
  setSelectedRequestId: (id?: number) => void
  setSelectedAccessItemId: (id?: number) => void
}
