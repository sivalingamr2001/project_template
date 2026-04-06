import { useState } from "react"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { cn } from "@/lib/utils"

const accessOptions = ["Not Applicable", "Read only", "Read and Write"]

// Assuming UserRole is a string or specific type from your hook
type UserRole = string | unknown

interface DetailItemProps {
  detail: {
    folderName: string
    accessType: string
    reason: string
    durationDays: number
  }
  index: number
  totalItems: number
  currentRole: UserRole | null // Added | null to fix your TS error
  onRemove: (index: number) => void
  onChange: (index: number, field: string, value: string | number) => void
}

export default function DetailItem({
  detail,
  index,
  totalItems,
  currentRole,
  onRemove,
  onChange,
}: DetailItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all">
      {/* Header/Toggle Bar */}
      <div
        className={cn(
          "flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-accent/50",
          isExpanded && "border-b bg-accent/10"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
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
              onRemove(index)
            }}
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expandable Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 p-4 pt-2">
              <div className="grid w-full grid-cols-1 items-end gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Folder Path</Label>
                  <Input
                    className="w-full"
                    value={detail.folderName}
                    onChange={(e) =>
                      onChange(index, "folderName", e.target.value)
                    }
                    placeholder="/finance/shared"
                    required
                  />
                </div>

                <div className="space-y-0">
                  <Label className="mb-2 text-sm font-medium">
                    Access Type
                  </Label>
                  <Select
                    value={detail.accessType}
                    onValueChange={(value) =>
                      onChange(index, "accessType", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accessOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Duration (Days)</Label>
                  <Input
                    className="w-full"
                    type="number"
                    min={1}
                    value={detail.durationDays}
                    onChange={(e) =>
                      onChange(
                        index,
                        "durationDays",
                        parseInt(e.target.value) || 1
                      )
                    }
                    disabled={currentRole === "User"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  value={detail.reason}
                  onChange={(e) => onChange(index, "reason", e.target.value)}
                  rows={2}
                  required
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
