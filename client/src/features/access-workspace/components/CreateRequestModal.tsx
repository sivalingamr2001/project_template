import { useState } from "react"

import {
  createAccessRequest,
  type AccessRequestFormPayload,
} from "@/lib/access-request-api"

import { IconX } from "@tabler/icons-react"
import { NewRequestForm } from "../request-form"
import { toast } from "sonner"

type CreateRequestModalProps = {
  initialData?: AccessRequestFormPayload
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  submitLabel?: string
  title?: string
}

function CreateRequestModal({
  initialData,
  isOpen,
  onClose,
  onSuccess,
  submitLabel,
  title = "Create Request",
}: CreateRequestModalProps) {
  const [errorMessage, setErrorMessage] = useState("")
  const [isPending, setIsPending] = useState(false)
  const handleSubmit = async (values: AccessRequestFormPayload) => {
    setErrorMessage("")
    setIsPending(true)
    try {
      await createAccessRequest(values)
      onSuccess?.()
      onClose()
      toast.success("Access request created successfully.")
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create access request."
      )
    } finally {
      setIsPending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4">
      <div className="w-full max-w-3xl rounded-[1.6rem] border border-border bg-card p-6 shadow-lg">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill the file user request details and submit for approval.
            </p>
          </div>
          <IconX className="size-5 cursor-pointer text-muted-foreground" onClick={onClose} />
        </div>
        {errorMessage ? (
          <p className="mb-4 text-sm text-destructive">{errorMessage}</p>
        ) : null}
        <NewRequestForm
          initialData={initialData}
          isPending={isPending}
          mode={initialData ? "edit" : "create"}
          onSubmit={handleSubmit}
          submitLabel={submitLabel}
        />
      </div>
    </div>
  )
}

export default CreateRequestModal
