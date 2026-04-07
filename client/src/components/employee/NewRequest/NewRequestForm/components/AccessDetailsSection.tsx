import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AccessRequestFormDetail } from "@/lib/access-request-api"
import type { UserRole } from "@/lib/types"

interface AccessDetailsSectionProps {
  details: AccessRequestFormDetail[]
  currentRole: UserRole | null
  onAdd: () => void
  onChange: (index: number, field: string, value: string | number) => void
  onRemove: (index: number) => void
}

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
        <h3 className="text-lg font-semibold">Access Details</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {details.map((detail, index) => (
          <div key={index} className="rounded-lg border p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Folder Path</label>
                <input
                  type="text"
                  value={detail.folderName}
                  onChange={(e) => onChange(index, "folderName", e.target.value)}
                  className="w-full rounded border border-border bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="/path/to/folder"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Access Type</label>
                <select
                  value={detail.accessType}
                  onChange={(e) => onChange(index, "accessType", e.target.value)}
                  className="w-full rounded border border-border bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Read only">Read only</option>
                  <option value="Read and Write">Read and Write</option>
                  {currentRole === "IT" && <option value="Admin">Admin</option>}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <input
                  type="text"
                  value={detail.reason}
                  onChange={(e) => onChange(index, "reason", e.target.value)}
                  className="w-full rounded border border-border bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Why do you need this access?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={detail.durationDays}
                  onChange={(e) => onChange(index, "durationDays", parseInt(e.target.value) || 365)}
                  className="w-full rounded border border-border bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {details.length > 1 && (
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemove(index)}
                >
                  Remove Item
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}