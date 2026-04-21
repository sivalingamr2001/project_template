import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import type { BudgetRecord } from "../types"

interface DraftConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onSaveDraft: () => void
  onClear: () => void
  record: BudgetRecord
}

export function DraftConfirmationDialog({
  isOpen,
  onClose,
  onSaveDraft,
  onClear,
  record,
}: DraftConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Budget Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes for the budget record:
            <br />
            <strong>Project:</strong> {record.projectHeader.productName}
            <br />
            <strong>Project Code:</strong> {record.projectHeader.projectCode}
            <br />
            <strong>Product Number:</strong> {record.projectHeader.productNo}
            <br />
            <br />
            Would you like to save this as a draft or clear the changes?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClear}>Clear Changes</AlertDialogCancel>
          <AlertDialogAction onClick={onSaveDraft}>
            Save as Draft
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
