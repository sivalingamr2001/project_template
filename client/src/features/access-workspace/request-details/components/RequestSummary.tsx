import type { AccessRequestDetails } from "../../types"
import { formatRequestDate } from "../utils/requestDetails"

type RequestSummaryProps = {
  details: AccessRequestDetails
}

const SUMMARY_FIELDS = [
  ["Requester", "requesterName"],
  ["Department", "departmentName"],
  ["Current Approver", "currentApproverName"],
  ["ITSR", "itsrNo"],
] as const

function RequestSummary({ details }: RequestSummaryProps) {
  return (
    <section className="rounded-[0.9rem] border border-border bg-card p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Employee Information</h2>
        <p className="text-sm text-muted-foreground">
          Requester profile and current workflow ownership.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SUMMARY_FIELDS.map(([label, key]) => (
          <FieldRow
            key={label}
            label={label}
            value={String(details[key] || "Not assigned")}
          />
        ))}
        <FieldRow label="Aggregate" value={details.aggregateStatus} />
        <FieldRow
          label="Submitted"
          value={formatRequestDate(details.createdOn)}
        />
        <FieldRow
          label="Last Updated"
          value={formatRequestDate(details.modifiedOn || details.createdOn)}
        />
      </div>
    </section>
  )
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[0.8rem] border border-border bg-background p-4">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  )
}

export default RequestSummary
