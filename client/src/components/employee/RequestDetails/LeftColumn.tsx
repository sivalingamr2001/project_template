import type { AccessRequest } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { AuditLog } from "@/components/shared/AuditLog"
import { StatusBadge } from "@/components/shared/StatusBadge"
import type { SelectedItem } from "./types"

interface Props {
  request: AccessRequest
  selectedItem: SelectedItem
  onSelectItem: (id: number) => void
}

export function LeftColumn({ request, selectedItem, onSelectItem }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Info label="Request ID" value={String(request.id)} /><Info label="Requester" value={request.requesterName} />
          <Info label="Department" value={request.requesterDept} /><Info label="Submitted" value={formatDate(request.requestedAt)} />
          <Info label="Item count" value={String(request.items.length)} />
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div><h2 className="text-lg font-semibold">Access items</h2><p className="text-sm text-muted-foreground">Each access item is managed independently.</p></div>
          <span className="w-30 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground uppercase">{request.items.length} items</span>
        </div>
        <div className="space-y-3">
          {request.items.map((item) => (
            <button key={item.id} type="button" onClick={() => onSelectItem(item.id)} className={`group w-full rounded-3xl border p-4 text-left transition ${selectedItem.id === item.id ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/60 hover:bg-primary/5"}`}>
              <div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{item.system}</p><p className="text-sm text-muted-foreground">{item.accessType}</p></div><StatusBadge status={item.status} size="sm" /></div>
              <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2"><Info label="Item ID" value={`#${item.id}`} /><Info label="Requested" value={formatDate(item.requestedAt)} /></div>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Audit Log</h2>
        <AuditLog request={request} selectedItemId={selectedItem.id} />
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{label}</p><p className="font-semibold">{value}</p></div>
}

