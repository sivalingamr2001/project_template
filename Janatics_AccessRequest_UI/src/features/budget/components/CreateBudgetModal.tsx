import { useMemo, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog"
import { useAuth } from "@/providers/auth-provider"
import { useDraftStorage } from "./hooks/useDraftStorage"
import { DraftResumePrompt } from "./CreateBudgetModal/DraftResumePrompt"
import { BudgetFormFields } from "./CreateBudgetModal/BudgetFormFields"
import { SearchResultDisplay } from "./CreateBudgetModal/SearchResultDisplay"
import type { BudgetRecordResponse } from "../types"

type CreateBudgetModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (input: {
    productName: string
    projectNumber: string
    productNo: string
  }) => Promise<void>
  initialData?: {
    productName: string
    projectNumber: string
    productNo: string
  }
}

export default function CreateBudgetModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CreateBudgetModalProps) {
  const { user } = useAuth()
  const draftKey = useMemo(
    () => `draft:create-budget:${user?.employeeId ?? "guest"}`,
    [user?.employeeId]
  )

  const {
    formData,
    setFormData,
    shouldPromptResume,
    hasStoredDraft,
    resumeStoredDraft,
    discardStoredDraft,
  } = useDraftStorage(draftKey, initialData, isOpen)

  const [searchResult] = useState<BudgetRecordResponse | null>(null)
  const [searchError] = useState<string | null>(null)
  const [isSearching] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (onSubmit) {
      await onSubmit({
        productName: formData.productName,
        projectNumber: formData.projectNumber,
        productNo: formData.productNo,
      })
    }

    setFormData({
      productName: "",
      projectNumber: "",
      productNo: "",
    })
    discardStoredDraft()

    if (!onSubmit) {
      onClose()
    }
  }

  const handleCancel = () => {
    setFormData({
      productName: "",
      projectNumber: "",
      productNo: "",
    })
    discardStoredDraft()
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="rounded-4xl p-8 sm:max-w-120">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Project Plan Entry
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            Fill in the details to initialize the project budget.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-6">
          {shouldPromptResume && hasStoredDraft && (
            <DraftResumePrompt
              onResume={resumeStoredDraft}
              onDiscard={discardStoredDraft}
            />
          )}

          <BudgetFormFields
            productName={formData.productName}
            projectNumber={formData.projectNumber}
            productNo={formData.productNo}
            onChange={handleChange}
          />

          <SearchResultDisplay
            searchResult={searchResult}
            searchError={searchError}
            isSearching={isSearching}
          />

          <DialogFooter className="mt-4 gap-3 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl px-8 shadow-md">
              Go To Plan Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
