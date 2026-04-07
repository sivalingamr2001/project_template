import { useCallback, useState, type MouseEvent } from "react"
import type { AccessRequest, AuditAction } from "../../lib/types"
import { formatDateTime } from "../../lib/utils"

interface AuditLogProps {
  request: AccessRequest
  selectedItemId?: number
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

export function AuditLog({ request, selectedItemId }: AuditLogProps) {
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null)

  const handleToggleItem = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const itemId = Number(event.currentTarget.value)
      setExpandedItemId((current) => (current === itemId ? null : itemId))
    },
    []
  )

  const filteredItems = selectedItemId
    ? request.items.filter((item) => item.id === selectedItemId)
    : request.items

  return (
    <div className="space-y-3">

      <div className="rounded border border-border bg-secondary/50 p-3">
        <div className="mb-2 text-xs font-medium text-muted-foreground">Request Created</div>
        <div className="text-sm">{formatDateTime(request.requestedAt)}</div>
      </div>

      {filteredItems.map((item) => (
        <div key={item.id} className="rounded border border-border">
          <button
            value={item.id}
            onClick={handleToggleItem}
            className="flex w-full items-center justify-between p-3 transition hover:bg-secondary/50"
          >
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-sm font-medium">{item.system}</div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  AccessID #{item.id}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">{item.accessType}</div>
            </div>
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
