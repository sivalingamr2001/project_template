import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface AgreementSectionProps {
  isAgreed: boolean
  isPending: boolean
  onChange: (checked: boolean | "indeterminate") => void
}

export function AgreementSection({
  isAgreed,
  isPending,
  onChange,
}: AgreementSectionProps) {
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
      </div>
    </div>
  )
}