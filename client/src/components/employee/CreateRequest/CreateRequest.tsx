import { Plus } from "lucide-react"
import { Toaster } from "sonner"
import { useData } from "@/context/DataContext"
import { useApp } from "@/hooks/useApp"
import { useCreateRequest } from "./hooks/useCreateRequest"
import { AccessItemFormComponent } from "./components/AccessItemForm"

export function CreateRequest() {
  const { addRequest } = useData()
  const { currentUser, setCurrentPage } = useApp()

  const {
    items,
    submitting,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleSubmit,
  } = useCreateRequest(currentUser?.employeeId ?? currentUser?.id, () => {
    setCurrentPage("EMPLOYEE_DASHBOARD")
  }, addRequest)

  return (
    <>
      <Toaster />
      <div className="rounded-lg border border-border bg-background p-6">
        <h2 className="mb-6 text-2xl font-bold">Create Access Request</h2>

        <div className="mb-6 space-y-4">
          {items.map((item) => (
            <AccessItemFormComponent
              key={item.id}
              item={item}
              canRemove={items.length > 1}
              onChange={handleItemChange}
              onRemove={handleRemoveItem}
            />
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
            onClick={() => handleSubmit()}
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
