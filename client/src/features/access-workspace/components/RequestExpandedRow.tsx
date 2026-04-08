import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

import type { AccessRequest } from "../types"

type RequestExpandedRowProps = {
  row: AccessRequest
}

function RequestExpandedRow({ row }: RequestExpandedRowProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <DetailBlock label="Folder Path" value={row.folderPath} />
      <DetailBlock label="Access Type" value={row.accessType} />
      <DetailBlock label="Current Status" value={row.status} />
      <DetailBlock label="Aggregate Status" value={row.aggregateStatus} />
      <DetailBlock label="ITSR" value={row.itsrNo ?? "Unassigned"} />
      <DetailBlock label="Created" value={row.createdOn} />
      <div className="lg:col-span-2">
        <DetailBlock label="Business Reason" value={row.reason} />
      </div>
      <div className="flex items-end justify-start lg:justify-end">
        <Button asChild size="sm" variant="outline">
          <Link to={`/requests/${row.accessReqId}`}>Open Request</Link>
        </Button>
      </div>
    </div>
  )
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-background p-3">
      <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm font-medium break-all">{value}</p>
    </div>
  )
}

export default RequestExpandedRow
