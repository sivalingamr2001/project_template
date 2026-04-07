import type { JSX } from "react"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import type { AccessRequest } from "@/lib/types"

export interface RequestListProps {
  requests: AccessRequest[]
  onSelectRequest: (id: number) => void
  onNewRequest: () => void
}

export const STATUS_ICON_MAP: Record<string, JSX.Element | null> = {
  Approved: <CheckCircle className="w-5 h-5 text-green-600" />,
  Rejected: <AlertCircle className="w-5 h-5 text-red-600" />,
  PendingHOD: <Clock className="w-5 h-5 text-yellow-600" />,
  PendingIT: <Clock className="w-5 h-5 text-yellow-600" />,
}

export const STATUS_COLOR_MAP: Record<string, string> = {
  Approved: "bg-green-50 border-green-200",
  Rejected: "bg-red-50 border-red-200",
  PendingHOD: "bg-yellow-50 border-yellow-200",
  PendingIT: "bg-yellow-50 border-yellow-200",
}

export function getItemStatusColor(status: string): string {
  const colorMap = {
    Approved: "bg-green-600",
    Rejected: "bg-red-600",
    PendingHOD: "bg-yellow-600",
    PendingIT: "bg-blue-600",
  }
  return colorMap[status as keyof typeof colorMap] || "bg-gray-600"
}
