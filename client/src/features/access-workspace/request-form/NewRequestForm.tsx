import { IconPlus, IconShieldExclamation } from "@tabler/icons-react"
import type { ChangeEvent, FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/hooks/useApp"
import type { AccessRequestFormPayload } from "@/lib/access-request-api"

import DetailItem from "./AccessDetail"
import { useAccessRequestForm } from "./hooks/useAccessRequestForm"
import type { NewRequestFormProps } from "./types"
import { createDefaultPayload } from "./utils/accessRequestForm"

type CheckboxValue = boolean | "indeterminate"

export function NewRequestForm({
  initialData,
  isPending,
  mode = "create",
  onSubmit,
  submitLabel = "Submit Request",
}: NewRequestFormProps) {
  const { currentRole, currentUser } = useApp()
  const employeeId = currentUser?.employeeId ?? 0
  const { formData, setFormData } = useAccessRequestForm(
    employeeId,
    initialData,
    mode
  )
  const handleBaseChange = (
    field: keyof AccessRequestFormPayload,
    value: boolean | number | string
  ) => setFormData((current) => ({ ...current, [field]: value }))
  const handleEmpIdChange = (event: ChangeEvent<HTMLInputElement>) =>
    handleBaseChange("empId", Number(event.target.value) || 0)
  const handleReqToChange = (event: ChangeEvent<HTMLInputElement>) =>
    handleBaseChange("reqTo", Number(event.target.value) || 0)
  const handleItsrNoChange = (event: ChangeEvent<HTMLInputElement>) =>
    handleBaseChange("itsrNo", event.target.value)
  const handleAgreeChange = (checked: CheckboxValue) =>
    handleBaseChange("isAgree", Boolean(checked))
  const handleDetailChange = (
    index: number,
    field: keyof AccessRequestFormPayload["items"][number],
    value: number | string
  ) =>
    setFormData((current) => ({
      ...current,
      items: current.items.map((detail, detailIndex) =>
        detailIndex === index ? { ...detail, [field]: value } : detail
      ),
    }))
  const handleAddDetail = () =>
    setFormData((current) => ({
      ...current,
      items: [...current.items, createDefaultPayload(employeeId).items[0]],
    }))
  const handleRemoveDetail = (index: number) =>
    setFormData((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((_, detailIndex) => detailIndex !== index),
    }))
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formData.isAgree) return
    onSubmit({ ...formData, empId: employeeId || formData.empId })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
          <Label htmlFor="reqTo">Req To</Label>
          <Input
            id="reqTo"
            value={formData.reqTo}
            onChange={handleReqToChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="itsrNo">ITSR #</Label>
          <Input
            id="itsrNo"
            placeholder="ITSR-001"
            value={formData.itsrNo}
            onChange={handleItsrNoChange}
          />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Access Details
          </h3>
          <Button
            type="button"
            size="sm"
            onClick={handleAddDetail}
            className="h-8 gap-1"
          >
            <IconPlus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
        {formData.items.map((detail, index) => (
          <DetailItem
            key={index}
            index={index}
            detail={detail}
            totalItems={formData.items.length}
            currentRole={currentRole}
            onRemove={handleRemoveDetail}
            onChange={handleDetailChange}
          />
        ))}
      </div>
      <div className="space-y-3 pt-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={formData.isAgree}
            onCheckedChange={handleAgreeChange}
          />
          <Label
            htmlFor="terms"
            className="cursor-pointer text-sm leading-none font-medium"
          >
            I agree with the company access policy and security guidelines.
          </Label>
        </div>
        {formData.isAgree ? null : (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <IconShieldExclamation className="h-3.5 w-3.5" />
            Agreement is required
          </p>
        )}
      </div>
      <Button
        type="submit"
        disabled={isPending || !formData.isAgree}
        className="w-full"
      >
        {isPending ? "Processing..." : submitLabel}
      </Button>
    </form>
  )
}
