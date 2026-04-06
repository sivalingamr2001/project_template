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
}

export function NewRequestModal({
  open,
  onClose,
  onSubmit,
  isPending,
}: NewRequestModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader className="border-b pb-2">
          <DialogTitle className="font-heading text-xl">
            New Access Request
          </DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          <NewRequestForm onSubmit={onSubmit} isPending={isPending} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
