import { Plus, Eye, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatDate } from "@/lib/utils"
import type { AccessRequest } from "@/lib/types"
import type { JSX } from "react"

interface RequestListProps {
  requests: AccessRequest[]
  onSelectRequest: (id: number) => void
  onNewRequest: () => void
}

const STATUS_ICON_MAP: Record<string, JSX.Element | null> = {
  Approved: <CheckCircle className="w-5 h-5 text-green-600" />,
  Rejected: <AlertCircle className="w-5 h-5 text-red-600" />,
  PendingHOD: <Clock className="w-5 h-5 text-yellow-600" />,
  PendingIT: <Clock className="w-5 h-5 text-yellow-600" />,
}

const STATUS_COLOR_MAP: Record<string, string> = {
  Approved: "bg-green-50 border-green-200",
  Rejected: "bg-red-50 border-red-200",
  PendingHOD: "bg-yellow-50 border-yellow-200",
  PendingIT: "bg-yellow-50 border-yellow-200",
}

export function RequestList({ requests, onSelectRequest, onNewRequest }: RequestListProps) {
  const isEmpty = requests.length === 0

  return (
    <div className="space-y-4">
      <HeaderBar onNewRequest={onNewRequest} />
      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onSelect={() => onSelectRequest(request.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function HeaderBar({ onNewRequest }: { onNewRequest: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">My Access Requests</h2>
      <button
        onClick={onNewRequest}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
      >
        <Plus size={18} />
        New Request
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12 bg-secondary/50 rounded border border-border">
      <p className="text-muted-foreground">No requests yet</p>
    </div>
  )
}

function RequestCard({
  request,
  onSelect,
}: {
  request: AccessRequest
  onSelect: () => void
}) {
  const statusColor = STATUS_COLOR_MAP[request.status] || "bg-secondary/50"
  const statusIcon = STATUS_ICON_MAP[request.status]

  return (
    <div
      className={`border rounded-lg p-4 hover:border-primary/50 hover:bg-secondary/30 transition cursor-pointer ${statusColor}`}
      onClick={onSelect}
    >
      <RequestCardHeader request={request} statusIcon={statusIcon} />
      <RequestCardContent request={request} />
    </div>
  )
}

function RequestCardHeader({
  request,
  statusIcon,
}: {
  request: AccessRequest
  statusIcon: JSX.Element | null
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            {statusIcon}
            <h3 className="font-semibold">{request.ticketNumber || `Request #${request.id}`}</h3>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </div>
      <Eye size={20} className="text-muted-foreground shrink-0 ml-4" />
    </div>
  )
}

function RequestCardContent({ request }: { request: AccessRequest }) {
  const itemCount = request.items.length
  const displayCount = 5

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        {itemCount} access item{itemCount !== 1 ? "s" : ""} • Requested {formatDate(request.requestedAt)}
      </p>

      <div className="space-y-1 mb-3">
        {request.items.slice(0, displayCount).map((item) => (
          <ItemStatus key={item.id} system={item.system} status={item.status} />
        ))}
        {itemCount > displayCount && (
          <p className="text-xs text-muted-foreground">+{itemCount - displayCount} more items</p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {request.items.slice(0, 3).map((item) => (
          <AccessTypeBadge key={item.id} type={item.accessType} />
        ))}
      </div>
    </div>
  )
}

function ItemStatus({ system, status }: { system: string; status: string }) {
  const statusColor = getItemStatusColor(status)
  return (
    <div className="text-xs flex items-center justify-between">
      <span className="text-muted-foreground">{system}</span>
      <span className={`px-2 py-1 rounded text-white ${statusColor}`}>{status}</span>
    </div>
  )
}

function getItemStatusColor(status: string): string {
  const colorMap = {
    Approved: "bg-green-600",
    Rejected: "bg-red-600",
    PendingHOD: "bg-yellow-600",
    PendingIT: "bg-blue-600",
  }
  return colorMap[status as keyof typeof colorMap] || "bg-gray-600"
}

function AccessTypeBadge({ type }: { type: string }) {
  return <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{type}</span>
}
