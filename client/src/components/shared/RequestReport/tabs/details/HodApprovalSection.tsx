import type { AccessRequest } from "@/lib/types"
import { User } from "lucide-react"
import { Field } from "../../components/Field"
import { SectionHeading } from "../../components/SectionHeading"

export function HodApprovalSection(props: { request: AccessRequest }) {
  const { request } = props

  const hodReviewer = request.approvalTimeline.find(
    (record) => record.action === "HODApproved" || record.action === "HODRejected"
  )

  return (
    <div className="mt-4">
      <SectionHeading icon={User} label="HOD Approval" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Field label="Approver" value={hodReviewer?.approverName} />
        <Field
          label="Decision"
          value={
            hodReviewer
              ? hodReviewer.action === "HODApproved"
                ? "Approved"
                : "Rejected"
              : "Pending"
          }
        />
        <Field label="Department" value={request.requesterDept} />
      </div>
    </div>
  )
}

