import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
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
import { FileDown, RefreshCcw, Save } from "lucide-react"
import { toast } from "sonner"
import type { BudgetRecord } from "@/features/budget/types"

interface ProjectHeaderProps {
  record: BudgetRecord
  onSaveDraft: () => Promise<void>
  onSaveRecord?: () => Promise<void>
  onDiscardDraft: () => void
  onExportCsv: () => void
}

export function ProjectHeader({
  record,
  onSaveDraft,
  onSaveRecord,
  onDiscardDraft,
  onExportCsv,
}: ProjectHeaderProps) {
  const [isRefreshConfirmOpen, setIsRefreshConfirmOpen] = useState(false)

  const isFormValid = Boolean(
    record.projectHeader.projectCode && record.projectHeader.productNo
  )

  async function handleSaveDraft() {
    try {
      await onSaveDraft()
      onDiscardDraft()
      toast.success("Budget saved. Returning to search.")
    } catch (error) {
      console.error(error)
      toast.error("Unable to save the budget draft.")
    }
  }

  function handleRefreshClick() {
    if (record.id.startsWith("draft-")) {
      setIsRefreshConfirmOpen(true)
      return
    }

    toast.success("Budget refreshed.")
  }

  function confirmRefresh() {
    onDiscardDraft()
    setIsRefreshConfirmOpen(false)
    toast.success("Draft session cleared. Returning to the project search view.")
  }

  const { projectHeader } = record

  return (
    <div className="border-b border-border/70 bg-muted/30 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">
            {projectHeader.productName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Project:</span>{" "}
            {projectHeader.projectCode} |{" "}
            <span className="text-foreground font-medium">Product No:</span>{" "}
            {projectHeader.productNo}
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <div className="flex gap-3 mr-3 text-sm text-muted-foreground">
            Modified On
            <div className="font-semibold text-foreground">
              {formatDate(projectHeader.lastUpdated)}
            </div>
          </div>
          <div className="shrink-0 flex flex-col gap-3 px-2 md:flex-row md:items-center md:justify-end">
            <Button size="sm" variant="outline" onClick={handleRefreshClick}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={onExportCsv} size="sm" variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            {onSaveRecord && (
              <Button
                disabled={!isFormValid}
                onClick={onSaveRecord}
                size="sm"
                variant="default"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Record
              </Button>
            )}
            <Button
              disabled={!isFormValid}
              onClick={handleSaveDraft}
              size="sm"
              variant="outline"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
          </div>
        </div>
      </div>
      <AlertDialog open={isRefreshConfirmOpen} onOpenChange={setIsRefreshConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard draft changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Refreshing now will clear your current draft session and return you
              to the project search view. Continue or keep editing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Button size="sm" variant="outline">
                Keep Editing
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction>
              <Button size="sm" variant="default" onClick={confirmRefresh}>
                Reload Drafts
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function formatDate(dateString: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString))
  } catch {
    return dateString
  }
}
