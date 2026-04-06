import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const ACCESS_OPTIONS = ["Not Applicable", "Read only", "Read and Write"]

interface DetailItemData {
  folderName: string
  accessType: string
  reason: string
  durationDays: number
}

interface AccessDetailItemProps {
  detail: DetailItemData
  index: number
  totalItems: number
  currentRole: string | null
  onChange: (index: number, field: string, value: string | number) => void
  onRemove: (index: number) => void
}

export function AccessDetailItem({
  detail,
  index,
  totalItems,
  currentRole,
  onChange,
  onRemove,
}: AccessDetailItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all">
      <ToggleHeader
        isExpanded={isExpanded}
        detail={detail}
        index={index}
        totalItems={totalItems}
        onToggle={() => setIsExpanded(!isExpanded)}
        onRemove={() => onRemove(index)}
      />

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 p-4 pt-2">
              <FolderPathField
                value={detail.folderName}
                onChange={(v) => onChange(index, "folderName", v)}
              />
              <div className="grid w-full grid-cols-1 items-end gap-4 md:grid-cols-3">
                <AccessTypeSelect
                  value={detail.accessType}
                  onChange={(v) => onChange(index, "accessType", v)}
                />
                <DurationField
                  value={detail.durationDays}
                  onChange={(v) => onChange(index, "durationDays", v)}
                  disabled={currentRole === "User"}
                />
              </div>
              <ReasonField
                value={detail.reason}
                onChange={(v) => onChange(index, "reason", v)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ToggleHeader({
  isExpanded,
  detail,
  index,
  totalItems,
  onToggle,
  onRemove,
}: {
  isExpanded: boolean
  detail: DetailItemData
  index: number
  totalItems: number
  onToggle: () => void
  onRemove: () => void
}) {
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
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="h-8 w-8 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

function FolderPathField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Folder Path</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/finance/shared"
        required
      />
    </div>
  )
}

function AccessTypeSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-0">
      <Label className="mb-2 text-sm font-medium">Access Type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ACCESS_OPTIONS.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function DurationField({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Duration (Days)</Label>
      <Input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 1)}
        disabled={disabled}
      />
    </div>
  )
}

function ReasonField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Reason for Access</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe why you need access to this resource"
        className="min-h-24 resize-none"
        required
      />
    </div>
  )
}
