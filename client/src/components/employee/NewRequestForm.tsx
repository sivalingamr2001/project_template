import { useApp } from "@/hooks/useApp"
import type { AccessRequestFormPayload } from "@/lib/access-request-api"
import { Plus, ShieldAlert } from "lucide-react"
import { useState } from "react"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import DetailItem from "./AccessDetail"

export function NewRequestForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (values: AccessRequestFormPayload) => void
  isPending: boolean
}) {
  const { currentRole, currentUser } = useApp()

  const [formData, setFormData] = useState<AccessRequestFormPayload>({
    empId: currentUser?.employeeId ?? currentUser?.id ?? 0,
    itsrNumber: "",
    isAgreed: false,
    details: [
      {
        folderName: "",
        accessType: "Read only",
        reason: "",
        durationDays: 365,
      },
    ],
  })

  const handleBaseChange = (
    field: keyof AccessRequestFormPayload,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDetailChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => {
      const newDetails = [...prev.details]
      newDetails[index] = { ...newDetails[index], [field as any]: value }
      return { ...prev, details: newDetails }
    })
  }

  const addDetail = () => {
    setFormData((prev) => ({
      ...prev,
      details: [
        ...prev.details,
        {
          folderName: "",
          accessType: "Read only",
          reason: "",
          durationDays: 30,
        },
      ],
    }))
  }

  const removeDetail = (index: number) => {
    if (formData.details.length === 1) return
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.isAgreed) return
    onSubmit({
      ...formData,
      empId: currentUser?.employeeId ?? currentUser?.id ?? formData.empId,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="empId">Employee ID</Label>
          <Input
            id="empId"
            value={formData.empId}
            onChange={(e) => handleBaseChange("empId", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="itsr">ITSR # (Optional)</Label>
          <Input
            id="itsr"
            placeholder="ITSR-001"
            value={formData.itsrNumber}
            onChange={(e) => handleBaseChange("itsrNumber", e.target.value)}
          />
        </div>
      </div>

      {/* Access Details List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Access Details
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDetail}
            className="h-8 gap-1"
          >
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>

        {formData.details.map((detail, index) => (
          <DetailItem
            key={index}
            index={index}
            detail={detail}
            totalItems={formData.details.length}
            currentRole={currentRole} // Passes 'UserRole | null'
            onRemove={removeDetail}
            onChange={handleDetailChange}
          />
        ))}
      </div>

      {/* Policy Agreement */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={formData.isAgreed}
            onCheckedChange={(checked) =>
              handleBaseChange("isAgreed", checked as boolean)
            }
          />
          <Label
            htmlFor="terms"
            className="cursor-pointer text-sm leading-none font-medium"
          >
            I agree with the company access policy and security guidelines.
          </Label>
        </div>
        {!formData.isAgreed && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <ShieldAlert className="h-3.5 w-3.5" /> Agreement is required
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending || !formData.isAgreed}
        className="w-full"
      >
        {isPending ? "Processing..." : "Submit Request"}
      </Button>
    </form>
  )
}
