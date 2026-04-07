import { ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import type { MouseEvent } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AccessDetailValue } from "./types"

interface Props {
  isExpanded: boolean
  detail: AccessDetailValue
  index: number
  totalItems: number
  onToggle: () => void
  onRemove: () => void
}

export function ToggleHeader({
  isExpanded,
  detail,
  index,
  totalItems,
  onToggle,
  onRemove,
}: Props) {
  const handleRemoveClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onRemove()
  }

  return (
    <div
      className={cn(
        "flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-accent/50",
        isExpanded && "border-b bg-accent/10"
      )}
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {detail.folderName || `Access Item ${index + 1}`}
          </span>
          {!isExpanded && (
            <span className="line-clamp-1 text-xs text-muted-foreground">
              {detail.accessType} • {detail.durationDays} Days
            </span>
          )}
        </div>
      </div>

      {totalItems > 1 && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleRemoveClick}
          className="h-8 w-8 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

