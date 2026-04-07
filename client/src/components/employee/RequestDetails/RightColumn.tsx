import { Button } from "@/components/ui/button"
import { ApprovalTimeline } from "@/components/shared/ApprovalTimeline"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatDate } from "@/lib/utils"
import type { AccessRequest } from "@/lib/types"
import type { SelectedItem } from "./types"

interface Props {
  request: AccessRequest
  selectedItem: SelectedItem
  selectedItemTimeline: AccessRequest["approvalTimeline"]
  itemsMap: Map<number, string>
  canReview: boolean
  onApprove: () => void
  onReject: () => void
}

export function RightColumn({
  request,
  selectedItem,
  selectedItemTimeline,
  itemsMap,
  canReview,
  onApprove,
  onReject,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Selected access item</p><h2 className="mt-2 text-2xl font-semibold">{selectedItem.system}</h2><p className="text-sm text-muted-foreground">{selectedItem.accessType}</p></div>
          <StatusBadge status={selectedItem.status} size="lg" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Info label="Request ID" value={String(request.id)} /><Info label="Access Item" value={`#${selectedItem.id}`} />
          <Info label="Requester" value={request.requesterName} /><Info label="Department" value={request.requesterDept} />
          <Info label="Expiry" value={formatDate(selectedItem.expiresAt)} /><Info label="Requested" value={formatDate(selectedItem.requestedAt)} />
        </div>
        <div className="mt-6 space-y-4"><div><p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Requested Reason</p><p className="mt-2 text-sm text-muted-foreground">{selectedItem.reason || "No reason provided for this access item."}</p></div><div><p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Item Status</p><p className="mt-2 font-semibold">{selectedItem.status}</p></div></div>
        {canReview ? <div className="mt-6 flex flex-wrap gap-3"><Button onClick={onApprove}>Approve</Button><Button variant="destructive" onClick={onReject}>Reject</Button></div> : null}
      </div>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Approval Timeline</h2>
        <ApprovalTimeline timeline={selectedItemTimeline} compact itemsMap={itemsMap} />
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{label}</p><p className="font-semibold">{value}</p></div>
}

