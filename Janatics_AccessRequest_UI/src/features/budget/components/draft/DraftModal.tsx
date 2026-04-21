import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import type { BudgetRecord } from "@/features/budget/types"

export interface StoredDraftRecord extends BudgetRecord {
  storageKey: string
}

type DraftModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  draftRecords: StoredDraftRecord[]
  onOpenDraft: (record: StoredDraftRecord) => void
  onDiscardDraft: (storageKey: string) => void
  onRefreshDraftSession: () => void
  isActiveDraft: boolean
}

function getRecordTotals(record: BudgetRecord) {
  return record.budgetData.reduce(
    (totals, category) => {
      const planned = category.items.reduce(
        (sum, item) => sum + item.planned,
        0
      )
      const actual = category.items.reduce((sum, item) => sum + item.actual, 0)
      return {
        totalPlanned: totals.totalPlanned + planned,
        totalActual: totals.totalActual + actual,
      }
    },
    { totalPlanned: 0, totalActual: 0 }
  )
}

export default function DraftModal({
  open,
  onOpenChange,
  draftRecords,
  onOpenDraft,
  onDiscardDraft,
  onRefreshDraftSession,
  isActiveDraft,
}: DraftModalProps) {
  const [isDraftRefreshConfirmOpen, setIsDraftRefreshConfirmOpen] =
    useState(false)

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] rounded-4xl p-6 lg:max-w-200">
          <DialogHeader>
            <DialogTitle>Draft Projects</DialogTitle>
            <DialogDescription>
              Open a saved draft or refresh the draft session before continuing.
            </DialogDescription>
          </DialogHeader>

          {draftRecords.length === 0 ? (
            <div className="rounded-3xl border border-border/80 bg-background/70 p-6 text-center text-sm text-muted-foreground">
              No draft budget projects are available yet. Create a draft from
              the dashboard to see it here.
            </div>
          ) : (
            <div className="grid gap-4">
              {draftRecords.map((record) => {
                const totals = getRecordTotals(record)
                return (
                  <div
                    key={record.storageKey}
                    className="rounded-3xl border border-border/70 bg-muted p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-semibold text-foreground">
                          {record.projectHeader.projectCode}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {record.projectHeader.productName}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                          <div>
                            Planned:{" "}
                            <span className="font-semibold text-foreground">
                              {totals.totalPlanned.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div>
                            Actual:{" "}
                            <span className="font-semibold text-foreground">
                              {totals.totalActual.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div>
                            Updated:{" "}
                            <span className="font-semibold text-foreground">
                              {new Date(
                                record.projectHeader.lastUpdated
                              ).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onOpenDraft(record)
                            onOpenChange(false)
                          }}
                        >
                          Open Draft
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDiscardDraft(record.storageKey)}
                        >
                          Discard
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <DialogFooter className="mt-6 gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (isActiveDraft) {
                  setIsDraftRefreshConfirmOpen(true)
                  return
                }

                onRefreshDraftSession()
                onOpenChange(false)
              }}
            >
              Refresh Draft Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDraftRefreshConfirmOpen}
        onOpenChange={setIsDraftRefreshConfirmOpen}
      >
        <DialogContent className="max-w-md rounded-4xl p-6">
          <DialogHeader>
            <DialogTitle>Confirm Refresh</DialogTitle>
            <DialogDescription>
              Your current draft will be cleared if you refresh. Continue or
              keep editing?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDraftRefreshConfirmOpen(false)}
            >
              Keep Editing
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                onRefreshDraftSession()
                setIsDraftRefreshConfirmOpen(false)
                onOpenChange(false)
              }}
            >
              Reload Drafts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
