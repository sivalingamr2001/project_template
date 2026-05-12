import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import { createAccessRequest, type AccessRequestFormPayload } from "@/lib/access-request-api"
import { fetchFolderHierarchy } from "../utils/requestApi"
import { useApp } from "@/hooks/useApp"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AccessDetailsSection } from "../access-request/access-details-section"
import { AgreementCheckbox } from "../access-request/agreement-checkbox"
import { EmployeeSection } from "../access-request/employee-section"
import { ReasonField } from "../access-request/reason-field"

type CreateRequestModalProps = {
  initialData?: AccessRequestFormPayload
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  submitLabel?: string
  title?: string
}

type FolderNode = {
  id: string
  name: string
  path: string
  children?: FolderNode[]
}

const DEFAULT_ITEM = {
  accessType: 1,
  confirmAccessTypeByHOD: 0,
  folderPath: "",
  reason: "",
}

function mapFolderHierarchy(
  folders: { name: string; children: any[] }[],
  parentPath = ""
): FolderNode[] {
  return folders.map((folder) => {
    const path = parentPath ? `${parentPath}/${folder.name}` : folder.name
    return {
      id: path,
      name: folder.name,
      path,
      children: folder.children
        ? mapFolderHierarchy(folder.children, path)
        : undefined,
    }
  })
}

function getDefaultFormValues(initialData?: AccessRequestFormPayload) {
  return {
    accessReqId: initialData?.accessReqId,
    empId: initialData?.empId ?? 0,
    isAgree: initialData?.isAgree ?? false,
    itsrNo: initialData?.itsrNo ?? "",
    reqTo: initialData?.reqTo ?? 0,
    items: initialData?.items && initialData.items.length > 0 ? initialData.items : [DEFAULT_ITEM],
  } satisfies AccessRequestFormPayload
}

function CreateRequestModal({
  initialData,
  isOpen,
  onClose,
  onSuccess,
  submitLabel = "Submit Request",
  title = "Create Access Request",
}: CreateRequestModalProps) {
  const { currentUser } = useApp()
  const currentUserId = currentUser?.employeeId ?? 0
  const [errorMessage, setErrorMessage] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [folders, setFolders] = useState<FolderNode[]>([])
  const [isLoadingFolders, setIsLoadingFolders] = useState(false)

  const form = useForm<AccessRequestFormPayload>({
    defaultValues: getDefaultFormValues(initialData),
  })

  useEffect(() => {
    form.reset(getDefaultFormValues(initialData))
  }, [initialData, form])

  useEffect(() => {
    setIsLoadingFolders(true)
    fetchFolderHierarchy()
      .then((data) => setFolders(mapFolderHierarchy(data)))
      .catch(() => setFolders([]))
      .finally(() => setIsLoadingFolders(false))
  }, [])

  const folderData = useMemo(
    () => (folders.length > 0 ? folders : []),
    [folders]
  )

  const handleSubmit = async (values: AccessRequestFormPayload) => {
    setErrorMessage("")
    setIsPending(true)
    try {
      await createAccessRequest(values)
      onSuccess?.()
      onClose()
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

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Request access to a folder by filling in the details below.
          </DialogDescription>
        </DialogHeader>

        {errorMessage ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-5 py-4"
        >
          <EmployeeSection form={form} currentUserId={currentUserId} />

          <AccessDetailsSection form={form} folders={folderData} />

          <ReasonField form={form} />

          <AgreementCheckbox form={form} />

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isPending || isLoadingFolders}
            >
              {isPending ? "Submitting..." : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateRequestModal
