import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { IconChevronDown, IconChevronUp, IconTrash } from "@tabler/icons-react"
import FolderSelector from "./FolderSelector"
import type { AccessDetailProps } from "./types"
import { ACCESS_OPTIONS } from "./utils/accessRequestForm"

export default function AccessDetail({
  currentRole,
  detail,
  index,
  isExpanded,
  onToggle,
  onChange,
  onRemove,
  totalItems,
}: AccessDetailProps) {
  const accessLabel = ACCESS_OPTIONS.find(
    (o) => o.value === detail.accessType
  )?.label

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Header / Toggle */}
      <div
        className={cn(
          "flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-accent/50",
          isExpanded ? "border-b bg-accent/10" : ""
        )}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground">
            {isExpanded ? (
              <IconChevronUp size={16} />
            ) : (
              <IconChevronDown size={16} />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {detail.folderPath || `New Access Item ${index + 1}`}
            </p>
            {!isExpanded && (
              <p className="text-xs text-muted-foreground">{accessLabel}</p>
            )}
          </div>
        </div>
        {totalItems > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(index)
            }}
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="animate-in space-y-4 p-4 duration-200 fade-in slide-in-from-top-1">
          <div className="grid gap-4 md:grid-cols-1">
            <FolderSelector
              value={detail.folderPath}
              onChange={(path) => onChange(index, "folderPath", path)}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Access Type</Label>
              <Select
                value={String(detail.accessType)}
                onValueChange={(val) =>
                  onChange(index, "accessType", Number(val))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCESS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* HOD Confirmation Select (Hidden for Users) */}
            {currentRole !== "User" && (
              <div className="space-y-2">
                <Label className="font-bold text-primary">
                  HOD Confirmation
                </Label>
                <Select
                  value={String(
                    detail.confirmAccessTypeByHOD || detail.accessType
                  )}
                  onValueChange={(val) =>
                    onChange(index, "confirmAccessTypeByHOD", Number(val))
                  }
                >
                  <SelectTrigger className="border-primary/50 bg-primary/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCESS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              value={detail.reason}
              onChange={(e) => onChange(index, "reason", e.target.value)}
              placeholder="Please provide business justification..."
              rows={2}
              required
            />
          </div>
        </div>
      )}
    </div>
  )
}
