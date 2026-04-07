import type { AccessRequest } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/StatusBadge"
import type { SelectedItem, WorkflowStep } from "./types"
import { getStepClasses } from "./utils"

interface Props {
  request: AccessRequest
  selectedItem: SelectedItem
  stepCards: WorkflowStep[]
}

export function HeroCard({ request, selectedItem, stepCards }: Props) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs tracking-[0.25em] text-muted-foreground uppercase">
            <span>Request ID #{request.id}</span><span className="inline-flex h-1 w-1 rounded-full bg-muted-foreground" /><span>Access Item #{selectedItem.id}</span>
          </div>
          <h1 className="text-3xl font-bold">{selectedItem.system}</h1>
          <p className="text-sm text-muted-foreground">{selectedItem.accessType} • Requested on {formatDate(selectedItem.requestedAt)}</p>
        </div>
        <div className="space-y-4 text-right">
          <StatusBadge status={selectedItem.status} size="lg" />
          <p className="text-sm text-muted-foreground">{request.requesterName} • {request.requesterDept}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stepCards.map((step, index) => (
          <div key={step.label} className={`rounded-2xl border p-3 transition ${getStepClasses(step.status)}`}>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-current text-sm font-semibold">{index + 1}</span>
              <span className="text-[11px] tracking-[0.3em] uppercase">{step.status === "complete" ? "Complete" : step.status === "active" ? "Active" : step.status === "failed" ? "Issue" : "Pending"}</span>
            </div>
            <h2 className="mt-3 text-sm font-semibold">{step.label}</h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

