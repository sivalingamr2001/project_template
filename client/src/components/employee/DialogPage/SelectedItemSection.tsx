import type { ChangeEvent } from "react"
import type { HODAccessTypes, AccessRequest } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { hodApprovalOptions } from "./constants"

interface Props {
  selectedItem: AccessRequest["items"][number]
  currentRole: string | null
  approvedAccess: HODAccessTypes
  durationDays: number
  onAccessTypeChange: (value: HODAccessTypes) => void
  onDurationChange: (value: number) => void
}

export function SelectedItemSection({ selectedItem, currentRole, approvedAccess, durationDays, onAccessTypeChange, onDurationChange }: Props) {
  const handleDurationChange = (event: ChangeEvent<HTMLInputElement>) => onDurationChange(parseInt(event.target.value, 10) || 1)

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">Selected Access Item</p>
      <div className="rounded-2xl border border-border p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="System" id="dialog-item-system" value={selectedItem.system} />
          <Field label="Requested Access" id="dialog-requested-access" value={selectedItem.accessType} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="dialog-item-approved-access">Approved Access</Label>
            <Select value={approvedAccess} onValueChange={(value) => onAccessTypeChange(value as HODAccessTypes)} disabled={currentRole !== "HOD"}>
              <SelectTrigger id="dialog-item-approved-access" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{hodApprovalOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dialog-item-duration">Duration (Days)</Label>
            <Input id="dialog-item-duration" type="number" min={1} value={durationDays} onChange={handleDurationChange} disabled={currentRole !== "HOD"} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, id, value }: { label: string; id: string; value: string }) {
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} value={value} disabled /></div>
}

