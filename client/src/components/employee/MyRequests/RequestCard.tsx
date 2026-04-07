import type { JSX } from "react"
import { Eye } from "lucide-react"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatDate } from "@/lib/utils"
import type { AccessRequest } from "@/lib/types"
import { getItemStatusColor, STATUS_COLOR_MAP } from "./RequestList.types"

interface Props {
  request: AccessRequest
  statusIcon: JSX.Element | null
  onSelect: () => void
}

export function RequestCard({ request, statusIcon, onSelect }: Props) {
  const statusColor = STATUS_COLOR_MAP[request.status] || "bg-secondary/50"
  const itemCount = request.items.length

  return (
    <div className={`cursor-pointer rounded-lg border p-4 transition hover:border-primary/50 hover:bg-secondary/30 ${statusColor}`} onClick={onSelect}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex items-center gap-2">
              {statusIcon}
              <h3 className="font-semibold">{request.ticketNumber || `Request #${request.id}`}</h3>
            </div>
            <StatusBadge status={request.status} />
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            {itemCount} access item{itemCount !== 1 ? "s" : ""} • Requested {formatDate(request.requestedAt)}
          </p>
          <div className="mb-3 space-y-1">
            {request.items.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.system}</span>
                <span className={`rounded px-2 py-1 text-white ${getItemStatusColor(item.status)}`}>{item.status}</span>
              </div>
            ))}
            {itemCount > 5 && <p className="text-xs text-muted-foreground">+{itemCount - 5} more items</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {request.items.slice(0, 3).map((item) => (
              <span key={item.id} className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                {item.accessType}
              </span>
            ))}
          </div>
        </div>
        <Eye size={20} className="ml-4 shrink-0 text-muted-foreground" />
      </div>
    </div>
  )
}

