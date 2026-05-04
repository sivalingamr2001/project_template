import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

interface BudgetFormFieldsProps {
  productName: string
  projectNumber: string
  productNo: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function BudgetFormFields({
  productName,
  projectNumber,
  productNo,
  onChange,
}: BudgetFormFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="productName">Product Name</Label>
        <Input
          id="productName"
          name="productName"
          placeholder="e.g., Smart Control System"
          value={productName}
          onChange={onChange}
          required
          className="h-11 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="productNo">Product Number</Label>
          <Input
            id="productNo"
            name="productNo"
            placeholder="NPD-2025-07"
            value={productNo}
            onChange={onChange}
            required
            className="h-11 rounded-xl"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="projectNumber">Project Number</Label>
          <Input
            id="projectNumber"
            name="projectNumber"
            placeholder="RD-001"
            value={projectNumber}
            onChange={onChange}
            required
            className="h-11 rounded-xl"
          />
        </div>
      </div>
    </>
  )
}
