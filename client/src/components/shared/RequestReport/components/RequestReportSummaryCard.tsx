import { Badge } from "./Badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import type { AccessRequest } from "@/lib/types"
import { getStatusVariant } from "../utils"

export function RequestReportSummaryCard(props: {
  request: AccessRequest
  onResubmit?: () => void
  isResubmitting?: boolean
}) {
  const { request, onResubmit, isResubmitting } = props

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-[0.32em] text-muted-foreground uppercase">
            File Server Folder Access Request
          </p>
          <p className="text-sm font-semibold text-foreground">Janatics India Pvt. Ltd.</p>
        </div>

        <div className="flex items-center justify-between gap-6 text-xs whitespace-nowrap">
          <div className="flex flex-col gap-1 space-y-1 text-right sm:text-left">
            <div className="flex gap-2 leading-none">
              <span className="tracking-[0.2em] text-muted-foreground uppercase opacity-70">
                Record No.
              </span>
              <span className="font-mono text-foreground">
                {request.ticketNumber || `REQ-${request.id}`}
              </span>
            </div>
            <div className="flex gap-2 leading-none">
              <span className="tracking-[0.2em] text-muted-foreground uppercase opacity-70">
                Issue Date
              </span>
              <span className="font-mono text-foreground">{formatDate(request.requestedAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l border-border pl-6">
            <Badge variant={getStatusVariant(request.status)}>{request.status}</Badge>
            {onResubmit && request.status === "Rejected" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onResubmit}
                disabled={isResubmitting}
                className="h-7 px-3"
              >
                {isResubmitting ? "Resubmitting..." : "Resubmit Request"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

