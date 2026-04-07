import { formatDate } from "@/lib/utils"
import type { AccessRequest } from "@/lib/types"
import { User } from "lucide-react"
import { Field } from "../../components/Field"
import { SectionHeading } from "../../components/SectionHeading"

export function EmployeeInfoSection(props: { request: AccessRequest }) {
  const { request } = props

  return (
    <div>
      <SectionHeading icon={User} label="Employee Information" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Field label="Employee ID" value={request.requesterId.toString()} mono />
        <Field label="Name" value={request.requesterName} />
        <Field label="Department" value={request.requesterDept} />
        <Field label="Requested On" value={formatDate(request.requestedAt)} mono />
        <Field label="Items Requested" value={`${request.items.length}`} />
        <Field label="Status" value={request.status} />
      </div>
    </div>
  )
}

