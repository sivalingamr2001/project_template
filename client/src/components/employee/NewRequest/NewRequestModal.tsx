import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { NewRequestForm } from "./NewRequestForm"
import type { AccessRequestFormPayload } from "@/lib/access-request-api"

interface NewRequestModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: AccessRequestFormPayload) => void
  isPending: boolean
  mode?: "create" | "edit"
  initialData?: AccessRequestFormPayload
}

export function NewRequestModal({
  open,
  onClose,
  onSubmit,
  isPending,
  mode = "create",
  initialData,
}: NewRequestModalProps) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader className="border-b pb-2">
          <DialogTitle className="font-heading text-xl">
            {mode === "edit" ? "Edit Access Request" : "New Access Request"}
          </DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          <NewRequestForm
            onSubmit={onSubmit}
            isPending={isPending}
            mode={mode}
            initialData={initialData}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
