import { useState } from "react"
import { Plus, Trash2, ShieldAlert } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Checkbox } from "../ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { useApp } from "@/hooks/useApp"
import type { AccessRequestFormPayload } from "@/lib/access-request-api"

const accessOptions = ["Not Applicable", "Read only", "Read and Write"]

export function NewRequestForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (values: AccessRequestFormPayload) => void
  isPending: boolean
}) {
  const [formData, setFormData] = useState<AccessRequestFormPayload>({
    empId: 0,
    itsrNumber: "",
    isAgreed: false,
    details: [
      { folderName: "", accessType: "Read", reason: "", durationDays: 365 },
    ],
  })

  const { currentRole, currentUser } = useApp()

  const handleBaseChange = (
    field: keyof AccessRequestFormPayload,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDetailChange = (
    index: number,
    field: keyof AccessRequestFormPayload["details"][number],
    value: string | number
  ) => {
    const newDetails = [...formData.details]
    newDetails[index] = { ...newDetails[index], [field]: value }
    setFormData((prev) => ({ ...prev, details: newDetails }))
  }

  const addDetail = () => {
    setFormData((prev) => ({
      ...prev,
      empId: currentUser?.employeeId ?? currentUser?.id ?? prev.empId,
      details: [
        ...prev.details,
        { folderName: "", accessType: "Read", reason: "", durationDays: 30 },
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
            placeholder="1234"
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
          <div
            key={index}
            className="relative space-y-4 rounded-xl border bg-card p-4 shadow-sm transition-all"
          >
            {formData.details.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDetail(index)}
                className="absolute top-2 right-2 h-8 w-8 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            <div className="grid w-full grid-cols-1 items-end gap-4 pt-2 md:grid-cols-3">
              {/* Folder Path - Takes 1/3 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Folder Path</Label>
                <Input
                  className="w-full"
                  value={detail.folderName}
                  onChange={(e) =>
                    handleDetailChange(index, "folderName", e.target.value)
                  }
                  placeholder="/finance/shared"
                  required
                />
              </div>

              {/* Access Type - Takes 1/3 */}
              <div className="space-y-0">
                <Label className="mb-2 text-sm font-medium">Access Type</Label>
                <Select
                  value={detail.accessType}
                  onValueChange={(value) =>
                    handleDetailChange(index, "accessType", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accessOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Duration (Days)</Label>
                <Input
                  className="w-full"
                  type="number"
                  min={1}
                  value={detail.durationDays}
                  onChange={(e) =>
                    handleDetailChange(
                      index,
                      "durationDays",
                      parseInt(e.target.value) || 1
                    )
                  }
                  disabled={currentRole === "User"}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label>Reason</Label>
                <Textarea
                  value={detail.reason}
                  onChange={(e) =>
                    handleDetailChange(index, "reason", e.target.value)
                  }
                  rows={2}
                  required
                />
              </div>
            </div>
          </div>
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
          <p className="flex animate-in items-center gap-1.5 text-xs text-destructive fade-in slide-in-from-left-1">
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
