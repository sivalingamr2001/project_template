import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AccessRequestFormPayload } from "@/lib/access-request-api"

interface HeaderFieldsProps {
  formData: AccessRequestFormPayload
  onChange: (field: keyof AccessRequestFormPayload, value: string | boolean | number) => void
}

export function HeaderFields({ formData, onChange }: HeaderFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="itsrNumber">ITSR Number (Optional)</Label>
        <Input
          id="itsrNumber"
          value={formData.itsrNumber}
          onChange={(e) => onChange("itsrNumber", e.target.value)}
          placeholder="Enter ITSR number if available"
        />
      </div>
    </div>
  )
}