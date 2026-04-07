import type { AccessRequest } from "@/lib/types"
import { Notebook } from "lucide-react"
import { Badge } from "../../components/Badge"
import { Field } from "../../components/Field"
import { SectionHeading } from "../../components/SectionHeading"
import { getAccessTypeLabel } from "../../utils"

export function AccessDetailsSection(props: { request: AccessRequest }) {
  const { request } = props
  const primaryItem = request.items[0]
  const hasMultipleItems = request.items.length > 1
  const accessReason = primaryItem?.reason || request.rejectionReason || ""

  return (
    <div className="mt-4">
      <SectionHeading icon={Notebook} label="Access Details" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Field label="Folder Name / Path" value={primaryItem?.system} mono />
        <Field label="Type of Access Required" value={getAccessTypeLabel(primaryItem?.accessType)}>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge variant={primaryItem?.accessType === "ReadOnly" ? "readonly" : "default"}>
              {primaryItem?.accessType === "ReadOnly" ? "✓" : "○"} Read-Only
            </Badge>
            <Badge
              variant={primaryItem?.accessType === "ReadAndWrite" ? "readwrite" : "default"}
            >
              {primaryItem?.accessType === "ReadAndWrite" ? "✓" : "○"} Read &amp; Write
            </Badge>
          </div>
        </Field>
        <Field label="Reason for Access" value={accessReason} />
        {hasMultipleItems && (
          <Field
            label="Additional Items"
            value={`${request.items.length - 1} more item${
              request.items.length - 1 === 1 ? "" : "s"
            }`}
          />
        )}
      </div>
    </div>
  )
}

