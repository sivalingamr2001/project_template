import { useState } from "react"
import { useData } from "../../context/DataContext"
import { useApp } from "@/hooks/useApp"
import { Plus, X } from "lucide-react"
import { Toaster, toast } from "sonner"
import type { AccessRequestFormPayload } from "@/lib/access-request-api"

interface AccessItemForm {
  id: number
  system: string
  accessType: string
  reason: string
}

export function CreateRequest() {
  const { addRequest } = useData()
  const { currentUser, setCurrentPage } = useApp()
  const [items, setItems] = useState<AccessItemForm[]>([
    { id: Date.now(), system: "", accessType: "Read only", reason: "" },
  ])
  const [submitting, setSubmitting] = useState(false)

  const handleAddItem = () => {
    setItems((current) => [
      ...current,
      { id: Date.now() + current.length, system: "", accessType: "Read only", reason: "" },
    ])
  }

  const handleRemoveItem = (id: number) => {
    if (items.length > 1) {
      setItems((current) => current.filter((item) => item.id !== id))
    }
  }

  const handleItemChange = (id: number, field: keyof AccessItemForm, value: string) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error("User session not available")
      return
    }

    if (items.some((item) => !item.system || !item.accessType || !item.reason)) {
      toast.error("Please fill in all fields")
      return
    }

    setSubmitting(true)

    try {
      const payload: AccessRequestFormPayload = {
        empId: currentUser.employeeId ?? currentUser.id,
        itsrNumber: "",
        isAgreed: true,
        details: items.map((item) => ({
          folderName: item.system,
          accessType: item.accessType,
          reason: item.reason,
          durationDays: 365,
        })),
      }
      await addRequest(payload)
      toast.success("Request created successfully!")
      setCurrentPage("EMPLOYEE_DASHBOARD")
    } catch (error) {
      console.error(error)
      toast.error("Failed to create request")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Toaster />
      <div className="rounded-lg border border-border bg-background p-6">
        <h2 className="mb-6 text-2xl font-bold">Create Access Request</h2>

        <div className="mb-6 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded border border-border bg-secondary/50 p-4">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium">Folder Path</label>
                <input
                  value={item.system}
                  onChange={(e) => handleItemChange(item.id, "system", e.target.value)}
                  className="w-full rounded border border-border bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium">Access Type</label>
                <input
                  value={item.accessType}
                  onChange={(e) => handleItemChange(item.id, "accessType", e.target.value)}
                  className="w-full rounded border border-border bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium">Reason</label>
                <input
                  value={item.reason}
                  onChange={(e) => handleItemChange(item.id, "reason", e.target.value)}
                  className="w-full rounded border border-border bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {items.length > 1 && (
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="self-end rounded p-2 text-destructive transition hover:bg-destructive/10"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleAddItem}
          className="mb-6 flex items-center gap-2 rounded border border-dashed border-primary px-4 py-2 text-primary transition hover:bg-primary/5"
        >
          <Plus size={18} />
          Add Another Item
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => {
              void handleSubmit()
            }}
            disabled={submitting}
            className="rounded bg-primary px-6 py-2 text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Request"}
          </button>
          <button
            onClick={() => setCurrentPage("EMPLOYEE_DASHBOARD")}
            className="rounded border border-border px-6 py-2 transition hover:bg-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}
