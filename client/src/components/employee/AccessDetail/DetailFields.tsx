import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ChangeEvent } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ACCESS_OPTIONS } from "./constants"
interface Props {
  folderName: string
  accessType: string
  reason: string
  durationDays: number
  isDurationDisabled: boolean
  onFolderNameChange: (value: string) => void
  onAccessTypeChange: (value: string) => void
  onDurationDaysChange: (value: number) => void
  onReasonChange: (value: string) => void
}

export function DetailFields({
  folderName,
  accessType,
  reason,
  durationDays,
  isDurationDisabled,
  onFolderNameChange,
  onAccessTypeChange,
  onDurationDaysChange,
  onReasonChange,
}: Props) {
  const handleFolderChange = (e: ChangeEvent<HTMLInputElement>) => onFolderNameChange(e.target.value)
  const handleDurationChange = (e: ChangeEvent<HTMLInputElement>) => onDurationDaysChange(parseInt(e.target.value) || 1)
  const handleReasonChange = (e: ChangeEvent<HTMLTextAreaElement>) => onReasonChange(e.target.value)

  return (
    <div className="space-y-4 p-4 pt-2">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Folder Path</Label>
        <Input className="w-full" value={folderName} onChange={handleFolderChange} placeholder="/finance/shared" required />
      </div>

      <div className="grid w-full grid-cols-1 items-end gap-4 md:grid-cols-3">
        <div className="space-y-0">
          <Label className="mb-2 text-sm font-medium">Access Type</Label>
          <Select value={accessType} onValueChange={onAccessTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCESS_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Duration (Days)</Label>
          <Input className="w-full" type="number" min={1} value={durationDays} onChange={handleDurationChange} disabled={isDurationDisabled} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Reason</Label>
        <Textarea value={reason} onChange={handleReasonChange} rows={2} required />
      </div>
    </div>
  )
}

