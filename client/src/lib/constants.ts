import type { AccessItemStatus, RequestStatus } from "./types"

export const STATUS_CONFIG: Record<
  RequestStatus | AccessItemStatus,
  { label: string; color: string; bgColor: string }
> = {
  PendingHOD: {
    label: "Pending HOD",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
  },
  PendingIT: {
    label: "Pending IT",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
  },
  Approved: {
    label: "Approved",
    color: "text-green-700",
    bgColor: "bg-green-50",
  },
  Rejected: {
    label: "Rejected",
    color: "text-red-700",
    bgColor: "bg-red-50",
  },
  Expired: {
    label: "Expired",
    color: "text-gray-700",
    bgColor: "bg-gray-50",
  },
  Revoked: {
    label: "Revoked",
    color: "text-red-700",
    bgColor: "bg-red-50",
  },
}

export const EXPIRY_WARNING_DAYS = 30
