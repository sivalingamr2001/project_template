import type { ApprovalRecord } from "../../lib/types"
import { formatDateTime } from "../../lib/utils"
import { Check, X } from "lucide-react"

interface ApprovalTimelineProps {
  timeline: ApprovalRecord[]
  compact?: boolean
}

function isApprovedAction(action: ApprovalRecord["action"]) {
  return action === "HODApproved" || action === "ITApproved" || action === "AccessGranted"
}

export function ApprovalTimeline({ timeline, compact = false }: ApprovalTimelineProps) {
  if (!timeline.length) {
    return <div className="text-sm italic text-muted-foreground">No approval activity yet</div>
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      {timeline.map((record, index) => (
        <div key={record.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`rounded-full p-2 ${
                isApprovedAction(record.action)
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isApprovedAction(record.action) ? <Check size={16} /> : <X size={16} />}
            </div>
            {index < timeline.length - 1 && <div className="mt-2 h-8 w-1 bg-border" />}
          </div>
          <div className="flex-1 pb-4">
            <div className="text-sm font-medium">
              {record.approverName} ({record.approverRole === "HOD" ? "HOD" : "IT"})
            </div>
            <div className="text-xs text-muted-foreground">{formatDateTime(record.timestamp)}</div>
            {record.comment && (
              <div className="mt-1 rounded border border-border bg-secondary/50 p-2 text-sm text-foreground">
                {record.comment}
              </div>
            )}
            <div className="mt-1 text-xs text-muted-foreground">
              {isApprovedAction(record.action) ? "Approved" : "Rejected"}
              {record.previousStatus && ` from ${record.previousStatus}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
