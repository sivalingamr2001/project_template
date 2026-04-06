import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"
import type { AccessRequest, AccessTypes, Notification, User } from "../lib/types"
import { useApp } from "@/hooks/useApp"
import {
  createAccessRequest,
  fetchDashboardData,
  fetchUsers,
  revokeAccessItem,
  type AccessRequestFormPayload,
  updateAccessApproval,
} from "../lib/access-request-api"

interface DataContextType {
  requests: AccessRequest[]
  notifications: Notification[]
  users: User[]
  setRequests: Dispatch<SetStateAction<AccessRequest[]>>
  refreshData: () => Promise<void>
  addRequest: (request: AccessRequest | AccessRequestFormPayload) => Promise<void>
  updateRequest: (request: AccessRequest) => void
  approveItem: (
    requestId: number,
    itemId: number,
    comment?: string,
    confirmedType?: AccessTypes
  ) => Promise<boolean>
  rejectItem: (requestId: number, itemId: number, comment?: string) => Promise<boolean>
  revokeItem: (requestId: number, itemId: number, note?: string) => Promise<void>
  extendItemExpiry: (requestId: number, itemId: number, days: number) => void
  markNotificationAsRead: (notificationId: number) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { currentRole, currentUser, isAuthenticated } = useApp()
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [users, setUsers] = useState<User[]>([])

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) {
      setRequests([])
      setNotifications([])
      setUsers([])
      return
    }

    const [dashboard, directory] = await Promise.all([fetchDashboardData(), fetchUsers()])
    setRequests(dashboard.requests)
    setNotifications(dashboard.notifications)
    setUsers(directory)
  }, [isAuthenticated])

  useEffect(() => {
    void refreshData()
  }, [refreshData, currentRole])

  const addRequest = async (request: AccessRequest | AccessRequestFormPayload) => {
    if ("details" in request) {
      const created = await createAccessRequest(request, currentUser)
      setRequests((current) => [created, ...current.filter((item) => item.id !== created.id)])
      return
    }

    setRequests((current) => [request, ...current.filter((item) => item.id !== request.id)])
  }

  const updateRequest = (updatedRequest: AccessRequest) => {
    setRequests((current) =>
      current.map((request) => (request.id === updatedRequest.id ? updatedRequest : request))
    )
  }

  const approveItem = async (
    requestId: number,
    itemId: number,
    comment?: string,
    _confirmedType?: AccessTypes
  ) => {
    if (!currentRole || currentRole === "User") return false

    await updateAccessApproval({
      requestId,
      detailId: itemId,
      approvalLevel: currentRole,
      status: "Approved",
      comments: comment,
    })
    await refreshData()
    return true
  }

  const rejectItem = async (requestId: number, itemId: number, comment?: string) => {
    if (!currentRole || currentRole === "User") return false

    await updateAccessApproval({
      requestId,
      detailId: itemId,
      approvalLevel: currentRole,
      status: "Rejected",
      comments: comment,
    })
    await refreshData()
    return true
  }

  const revokeItem = async (requestId: number, itemId: number, note?: string) => {
    const updated = await revokeAccessItem(requestId, itemId, note)
    updateRequest(updated)
  }

  const extendItemExpiry = (_requestId: number, _itemId: number, _days: number) => {
    console.warn("Extend expiry is not implemented for the current backend.")
  }

  const markNotificationAsRead = (notificationId: number) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  return (
    <DataContext.Provider
      value={{
        requests,
        notifications,
        users,
        setRequests,
        refreshData,
        addRequest,
        updateRequest,
        approveItem,
        rejectItem,
        revokeItem,
        extendItemExpiry,
        markNotificationAsRead,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within DataProvider")
  }
  return context
}
