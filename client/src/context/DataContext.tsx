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
import type {
  AccessRequest,
  AccessTypes,
  HODAccessTypes,
  Notification,
  User,
} from "../lib/types"
import { useApp } from "@/hooks/useApp"
import {
  createAccessRequest,
  fetchDashboardData,
  fetchUsers,
  revokeAccessItem,
  sendNotificationToRequester,
  type AccessRequestFormPayload,
  updateAccessApproval,
  updateAccessRequest,
} from "../lib/access-request-api"

interface DataContextType {
  requests: AccessRequest[]
  notifications: Notification[]
  users: User[]
  setRequests: Dispatch<SetStateAction<AccessRequest[]>>
  refreshData: () => Promise<void>
  addRequest: (
    request: AccessRequest | AccessRequestFormPayload
  ) => Promise<void>
  updateRequest: (
    requestId: number,
    accessItemId: number,
    selectedItem: AccessRequest,
    payload: AccessRequestFormPayload
  ) => Promise<void>
  approveItem: (
    requestId: number,
    itemId: number,
    comment?: string,
    confirmedType?: AccessTypes,
    approvedType?: HODAccessTypes,
    durationDays?: number
  ) => Promise<boolean>
  rejectItem: (
    requestId: number,
    itemId: number,
    comment?: string
  ) => Promise<boolean>
  revokeItem: (
    requestId: number,
    itemId: number,
    note?: string
  ) => Promise<void>
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

    const [dashboard, directory] = await Promise.all([
      fetchDashboardData(),
      fetchUsers(),
    ])
    setRequests(dashboard.requests)
    setNotifications(dashboard.notifications)
    setUsers(directory)
  }, [isAuthenticated])

  useEffect(() => {
    void refreshData()
  }, [refreshData, currentRole])

  const addRequest = async (
    request: AccessRequest | AccessRequestFormPayload
  ) => {
    if ("details" in request) {
      const created = await createAccessRequest(request, currentUser)
      setRequests((current) => [
        created,
        ...current.filter((item) => item.id !== created.id),
      ])
      return
    }

    setRequests((current) => [
      request,
      ...current.filter((item) => item.id !== request.id),
    ])
  }

  const updateRequest = async (
    requestId: number,
    accessItemId: number,
    selectedItem: AccessRequest,
    payload: AccessRequestFormPayload
  ) => {
    const updated = await updateAccessRequest(
      requestId,
      accessItemId,
      selectedItem,
      payload,
      currentUser
    )
    setRequests((current) =>
      current.map((request) => (request.id === requestId ? updated : request))
    )
  }

  const approveItem = async (
    requestId: number,
    itemId: number,
    comment?: string,
    _confirmedType?: AccessTypes,
    approvedType?: HODAccessTypes,
    durationDays?: number
  ) => {
    if (!currentRole || currentRole === "User") return false

    try {
      await updateAccessApproval({
        requestId,
        detailId: itemId,
        approvalLevel: currentRole,
        status: "Approved",
        comments: comment,
        approvedType,
        durationDays,
      })

      // Send notification to requester
      const notificationMessage = `${currentRole} approved your request for ${requestId}${durationDays ? ` for ${durationDays} days` : ""}`
      await sendNotificationToRequester(
        requestId,
        itemId,
        "approved",
        currentRole,
        notificationMessage
      )

      // Refresh to get updated notifications from backend
      await refreshData()

      // Log approval for audit trail
      console.log(
        `[${currentRole}] Approved item ${itemId} for request ${requestId}`,
        {
          durationDays,
          comment,
          approvedType,
        }
      )

      return true
    } catch (error) {
      console.error("Error approving item:", error)
      throw error
    }
  }

  const rejectItem = async (
    requestId: number,
    itemId: number,
    comment?: string
  ) => {
    if (!currentRole || currentRole === "User") return false

    try {
      await updateAccessApproval({
        requestId,
        detailId: itemId,
        approvalLevel: currentRole,
        status: "Rejected",
        comments: comment,
      })

      // Send notification to requester
      const notificationMessage = `${currentRole} rejected your request for item ${itemId}${comment ? `: ${comment}` : ""}`
      await sendNotificationToRequester(
        requestId,
        itemId,
        "rejected",
        currentRole,
        notificationMessage
      )

      // Refresh to get updated notifications from backend
      await refreshData()

      // Log rejection for audit trail
      console.log(
        `[${currentRole}] Rejected item ${itemId} for request ${requestId}`,
        {
          reason: comment,
        }
      )

      return true
    } catch (error) {
      console.error("Error rejecting item:", error)
      throw error
    }
  }

  const revokeItem = async (
    requestId: number,
    itemId: number,
    note?: string
  ) => {
    const updated = await revokeAccessItem(requestId, itemId, note)
    setRequests((current) =>
      current.map((request) => (request.id === updated.id ? updated : request))
    )
  }

  const extendItemExpiry = (
    _requestId: number,
    _itemId: number,
    _days: number
  ) => {
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
