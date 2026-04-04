import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { NewRequestForm } from "./NewRequestForm"

// Updated interface to match the new multi-item structure
interface AccessDetail {
  folderName: string
  accessType: string
  reason: string
  durationDays: number
}

interface CreateRequestPayload {
  empId: number
  itsrNumber: string
  isAgreed: boolean
  details: AccessDetail[]
}

export function NewRequestModal({
  open,
  onClose,
  onSubmit,
  isPending,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (values: CreateRequestPayload) => void
  isPending: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader className="border-b pb-2">
          <DialogTitle className="font-heading text-xl">
            New Access Request
          </DialogTitle>
        </DialogHeader>

        <div className="pt-4">
          <NewRequestForm
            onSubmit={(values) => {
              onSubmit(values)
            }}
            isPending={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
