import type { Dispatch, SetStateAction } from "react"
import type {
  AccessRequest,
  AccessTypes,
  HODAccessTypes,
  Notification,
  User,
} from "../../lib/types"
import type { AccessRequestFormPayload } from "../../lib/access-request-api"

export interface DataContextType {
  requests: AccessRequest[]
  notifications: Notification[]
  users: User[]
  setRequests: Dispatch<SetStateAction<AccessRequest[]>>
  refreshData: () => Promise<void>
  addRequest: (
    request: AccessRequest | AccessRequestFormPayload
  ) => Promise<void>
  updateRequest: (request: AccessRequest) => void
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
