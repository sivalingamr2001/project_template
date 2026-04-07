import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AccessRequest } from "@/lib/types"

interface Props {
  request: AccessRequest
}

export function RequestInfoGrid({ request }: Props) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Request ID" id="dialog-request-id" value={String(request.id)} />
        <Field label="Requester" id="dialog-requester" value={request.requesterName} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Department" id="dialog-department" value={request.requesterDept} />
        <Field label="Current Status" id="dialog-status" value={request.status} />
      </div>
    </>
  )
}

function Field({ label, id, value }: { label: string; id: string; value: string }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} disabled />
    </div>
  )
}

