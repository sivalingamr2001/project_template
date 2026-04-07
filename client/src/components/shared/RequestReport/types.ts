import type { AccessRequest } from "@/lib/types"

export type RequestReportTabId = "details" | "policy" | "itdept"

export interface RequestReportProps {
  request: AccessRequest
  open: boolean
  onOpenChange: (open: boolean) => void
  onResubmit?: () => void
  isResubmitting?: boolean
}

