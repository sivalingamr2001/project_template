import type { AccessRequest } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { Check } from "lucide-react"
import { Field } from "../../components/Field"
import { SectionHeading } from "../../components/SectionHeading"

export function AcknowledgementSection(props: { request: AccessRequest }) {
  const { request } = props

  return (
    <div className="mt-4">
      <SectionHeading icon={Check} label="Acknowledgment by Requestor" />
      <div className="mb-4 rounded-lg border border-border bg-card/60 p-3">
        <p className="text-xs leading-relaxed text-muted-foreground italic">
          "I acknowledge that I have read and agree to comply with the organization's
          data access policies and security guidelines."
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="ITSR Number" value={request.ticketNumber || "N/A"} mono />
        <Field label="Request Date" value={formatDate(request.requestedAt)} mono />
        <Field label="Submitted By" value={request.requesterName} />
      </div>
    </div>
  )
}

