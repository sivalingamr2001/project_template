import { IconChevronDown, IconChevronUp, IconTrash } from "@tabler/icons-react"
import { useState, type ChangeEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

import type { AccessDetailProps } from "./types"
import { ACCESS_OPTIONS } from "./utils/accessRequestForm"

export default function AccessDetail({
  currentRole,
  detail,
  index,
  onChange,
  onRemove,
  totalItems,
}: AccessDetailProps) {
  const [isExpanded, setIsExpanded] = useState(index === 0)
  const accessLabel = ACCESS_OPTIONS.find(
    (option) => option.value === detail.accessType
  )?.label
  const handleToggle = () => setIsExpanded((current) => !current)
  const handleRemove = () => onRemove(index)
  const handleFolderPathChange = (event: ChangeEvent<HTMLInputElement>) =>
    onChange(index, "folderPath", event.target.value)
  const handleAccessTypeChange = (value: string) =>
    onChange(index, "accessType", Number(value))
  const handleConfirmChange = (event: ChangeEvent<HTMLInputElement>) =>
    onChange(index, "confirmAccessTypeByHOD", Number(event.target.value) || 0)
  const handleReasonChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    onChange(index, "reason", event.target.value)

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div
        className={cn(
          "flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-accent/50",
          isExpanded ? "border-b bg-accent/10" : ""
        )}
        onClick={handleToggle}
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
              {detail.folderPath || `Access Item ${index + 1}`}
            </p>
            <p className="text-xs text-muted-foreground">{accessLabel}</p>
          </div>
        </div>
        {totalItems > 1 ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      {isExpanded ? (
        <div className="space-y-4 p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Folder Path</Label>
              <Input
                value={detail.folderPath}
                onChange={handleFolderPathChange}
                placeholder="\\\\fileserver\\finance\\shared"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Access Type</Label>
              <Select
                value={String(detail.accessType)}
                onValueChange={handleAccessTypeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCESS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Confirm Access Type By HOD</Label>
              <Input
                min={0}
                type="number"
                value={detail.confirmAccessTypeByHOD}
                onChange={handleConfirmChange}
                disabled={currentRole === "User"}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              value={detail.reason}
              onChange={handleReasonChange}
              rows={2}
              required
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
