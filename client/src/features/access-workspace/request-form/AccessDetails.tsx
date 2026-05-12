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
import { IconChevronDown, IconChevronUp, IconTrash, IconFolder, IconLock, IconFileText } from "@tabler/icons-react"
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
    <div className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:border-blue-300 hover:shadow-sm">
      {/* Header / Toggle */}
      <div
        className={cn(
          "flex cursor-pointer items-center justify-between px-4 py-4 transition-all duration-300",
          isExpanded ? "border-b border-gray-200 bg-blue-50" : "hover:bg-gray-50"
        )}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onToggle()
          }
        }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={cn(
            "text-blue-600 transition-transform duration-300 flex-shrink-0",
            isExpanded && "rotate-180"
          )}>
            <IconChevronDown size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <IconFolder size={14} className="text-blue-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-gray-900 truncate">
                {detail.folderPath || `New Access Item ${index + 1}`}
              </p>
            </div>
            {!isExpanded && (
              <div className="flex items-center gap-2">
                <IconLock size={12} className="text-gray-500 flex-shrink-0" />
                <p className="text-xs text-gray-600 truncate">{accessLabel}</p>
              </div>
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
            className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-50 ml-2 flex-shrink-0 transition-colors"
          >
            <IconTrash size={16} />
          </Button>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="animate-in space-y-5 p-5 duration-300 fade-in slide-in-from-top-2">
          {/* Folder Selection Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <IconFolder size={14} className="text-blue-600" />
              <Label className="text-sm font-semibold text-gray-900">Select Folder Path</Label>
              <span className="text-red-500 ml-1 font-bold">*</span>
            </div>
            <div className="rounded-lg p-4 border border-gray-200 bg-blue-50">
              <FolderSelector
                value={detail.folderPath}
                onChange={(path) => onChange(index, "folderPath", path)}
                required
              />
            </div>
          </div>

          {/* Access Type & HOD Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <IconLock size={14} className="text-blue-600" />
                <Label htmlFor={`access-${index}`} className="text-sm font-semibold text-gray-900">Access Type</Label>
                <span className="text-red-500 ml-1 font-bold">*</span>
              </div>
              <Select
                value={String(detail.accessType)}
                onValueChange={(val) =>
                  onChange(index, "accessType", Number(val))
                }
              >
                <SelectTrigger id={`access-${index}`} className="h-10 border-gray-200 bg-white hover:border-blue-300 transition-colors rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="bottom" align="start" avoidCollisions={true}>
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
              <div className="space-y-3">
                <Label htmlFor={`hod-${index}`} className="text-sm font-semibold text-gray-900">HOD Confirmation</Label>
                <Select
                  value={String(
                    detail.confirmAccessTypeByHOD || detail.accessType
                  )}
                  onValueChange={(val) =>
                    onChange(index, "confirmAccessTypeByHOD", Number(val))
                  }
                >
                  <SelectTrigger 
                    id={`hod-${index}`}
                    className="h-10 border-gray-200 bg-yellow-50 hover:border-yellow-300 transition-colors rounded-lg"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" avoidCollisions={true}>
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

          {/* Reason Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <IconFileText size={14} className="text-blue-600" />
              <Label htmlFor={`reason-${index}`} className="text-sm font-semibold text-gray-900">Reason</Label>
              <span className="text-red-500 ml-1 font-bold">*</span>
            </div>
            <Textarea
              id={`reason-${index}`}
              value={detail.reason}
              onChange={(e) => onChange(index, "reason", e.target.value)}
              placeholder="Explain the business need for this access request..."
              rows={3}
              required
              className="border-gray-200 bg-white hover:border-blue-300 focus:border-blue-500 transition-colors resize-none text-sm rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
