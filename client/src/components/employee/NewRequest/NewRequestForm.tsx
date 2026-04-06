import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/hooks/useApp"
import type { AccessRequestFormPayload } from "@/lib/access-request-api"
import { AccessDetailItem } from "./components/AccessDetailItem"

interface NewRequestFormProps {
  onSubmit: (values: AccessRequestFormPayload) => void
  isPending: boolean
}

export function NewRequestForm({ onSubmit, isPending }: NewRequestFormProps) {
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

  const handleAddDetail = () => {
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

  const handleRemoveDetail = (index: number) => {
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
      <HeaderFields formData={formData} onChange={handleBaseChange} />
      <AccessDetailsSection
        details={formData.details}
        currentRole={currentRole}
        onAdd={handleAddDetail}
        onChange={handleDetailChange}
        onRemove={handleRemoveDetail}
      />
      <AgreementSection
        isAgreed={formData.isAgreed}
        onChange={(checked) => handleBaseChange("isAgreed", checked)}
        onSubmit={handleSubmit}
        isPending={isPending}
      />
    </form>
  )
}

function HeaderFields({
  formData,
  onChange,
}: {
  formData: AccessRequestFormPayload
  onChange: (field: keyof AccessRequestFormPayload, value: string | number) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="empId">Employee ID</Label>
        <Input
          id="empId"
          value={formData.empId}
          onChange={(e) => onChange("empId", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="itsr">ITSR # (Optional)</Label>
        <Input
          id="itsr"
          placeholder="ITSR-001"
          value={formData.itsrNumber}
          onChange={(e) => onChange("itsrNumber", e.target.value)}
        />
      </div>
    </div>
  )
}

function AccessDetailsSection({
  details,
  currentRole,
  onAdd,
  onChange,
  onRemove,
}: {
  details: AccessRequestFormPayload["details"]
  currentRole: string | null
  onAdd: () => void
  onChange: (index: number, field: string, value: string | number) => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Access Details
        </h3>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={onAdd}
          className="h-8 gap-1"
        >
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      {details.map((detail, index) => (
        <AccessDetailItem
          key={index}
          index={index}
          detail={detail}
          totalItems={details.length}
          currentRole={currentRole}
          onChange={onChange}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

function AgreementSection({
  isAgreed,
  onChange,
  onSubmit,
  isPending,
}: {
  isAgreed: boolean
  onChange: (checked: boolean) => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
}) {
  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" checked={isAgreed} onCheckedChange={onChange} />
        <Label htmlFor="terms" className="text-sm">
          I agree to the access policy and data handling terms
        </Label>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={!isAgreed || isPending}>
          {isPending ? "Submitting..." : "Submit Request"}
        </Button>
        <Button type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  )
}
