import { X } from "lucide-react"
import type { AccessItemForm } from "../types"

const ACCESS_TYPE_OPTIONS = ["Read only", "Read and Write", "Admin"]

interface AccessItemFormProps {
  item: AccessItemForm
  canRemove: boolean
  onChange: (id: number, field: keyof AccessItemForm, value: string | number) => void
  onRemove: (id: number) => void
}

export function AccessItemFormComponent({
  item,
  canRemove,
  onChange,
  onRemove,
}: AccessItemFormProps) {
  const handleInputChange = (field: keyof AccessItemForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = field === "durationDays" ? parseInt(e.target.value) : e.target.value
    onChange(item.id, field, value)
  }

  return (
    <div className="flex gap-4 rounded border border-border bg-secondary/50 p-4">
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium">Folder Path</label>
        <input
          value={item.system}
          onChange={handleInputChange("system")}
          className="w-full rounded border border-border bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="/path/to/folder"
        />
      </div>

      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium">Access Type</label>
        <select
          value={item.accessType}
          onChange={handleInputChange("accessType")}
          className="w-full rounded border border-border bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {ACCESS_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium">Reason</label>
        <input
          value={item.reason}
          onChange={handleInputChange("reason")}
          className="w-full rounded border border-border bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Why do you need this access?"
        />
      </div>

      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium">Duration (Days)</label>
        <input
          type="number"
          min="1"
          value={item.durationDays}
          onChange={handleInputChange("durationDays")}
          className="w-full rounded border border-border bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {canRemove && (
        <button
          onClick={() => onRemove(item.id)}
          className="self-end rounded p-2 text-destructive transition hover:bg-destructive/10"
        >
          <X size={20} />
        </button>
      )}
    </div>
  )
}
