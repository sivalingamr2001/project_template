import { useState } from "react"
import type { AccessRequest, AuditAction } from "../../lib/types"
import { formatDateTime } from "../../lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

interface AuditLogProps {
  request: AccessRequest
}

function getActionLabel(action: AuditAction) {
  switch (action) {
    case "HODApproved":
    case "ITApproved":
    case "AccessGranted":
      return "Approved"
    case "HODRejected":
    case "ITRejected":
      return "Rejected"
    case "Revoked":
      return "Revoked"
    case "Expired":
      return "Expired"
    default:
      return "Created"
  }
}

export function AuditLog({ request }: AuditLogProps) {
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Audit Log</h3>

      <div className="rounded border border-border bg-secondary/50 p-3">
        <div className="mb-2 text-xs font-medium text-muted-foreground">Request Created</div>
        <div className="text-sm">{formatDateTime(request.requestedAt)}</div>
      </div>

      {request.items.map((item) => (
        <div key={item.id} className="rounded border border-border">
          <button
            onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
            className="flex w-full items-center justify-between p-3 transition hover:bg-secondary/50"
          >
            <div className="text-left">
              <div className="text-sm font-medium">{item.system}</div>
              <div className="text-xs text-muted-foreground">{item.accessType}</div>
            </div>
            {expandedItemId === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {expandedItemId === item.id && item.approvalHistory.length > 0 && (
            <div className="space-y-2 border-t border-border bg-secondary/30 p-3">
              {item.approvalHistory.map((record) => (
                <div key={record.id} className="text-xs">
                  <div className="font-medium">
                    {record.approverName} ({record.approverRole === "HOD" ? "HOD" : "IT"})
                  </div>
                  <div className="text-muted-foreground">{getActionLabel(record.action)}</div>
                  <div className="text-muted-foreground">{formatDateTime(record.timestamp)}</div>
                  {record.previousStatus && (
                    <div className="text-muted-foreground">
                      Status: {record.previousStatus} → {getActionLabel(record.action)}
                    </div>
                  )}
                  {record.comment && (
                    <div className="mt-1 rounded border border-border bg-white p-2 dark:bg-slate-900">
                      "{record.comment}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
