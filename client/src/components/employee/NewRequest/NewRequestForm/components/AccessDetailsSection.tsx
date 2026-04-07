import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccessDetailItem } from "../../components/AccessDetailItem"
import type { AccessDetailsSectionProps } from "../types"

export function AccessDetailsSection({
  details,
  currentRole,
  onAdd,
  onChange,
  onRemove,
}: AccessDetailsSectionProps) {
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
