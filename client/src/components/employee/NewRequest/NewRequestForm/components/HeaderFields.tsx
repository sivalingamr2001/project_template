import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { HeaderFieldsProps } from "../types"

export function HeaderFields({ formData, onChange }: HeaderFieldsProps) {
  const handleEmpIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange("empId", e.target.value)
  }

  const handleItsrNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange("itsrNumber", e.target.value)
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="empId">Employee ID</Label>
        <Input
          id="empId"
          value={formData.empId}
          onChange={handleEmpIdChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="itsr">ITSR # (Optional)</Label>
        <Input
          id="itsr"
          placeholder="ITSR-001"
          value={formData.itsrNumber}
          onChange={handleItsrNumberChange}
        />
      </div>
    </div>
  )
}
