import { Button } from "@/components/ui/button"
import { GetCurrentUser } from "@/lib/utils"
import { useMemo, useState } from "react"
import CommonTable from "./components/CommonTable"
import PageSection from "./components/PageSection"
import { useAccessWorkspace } from "./hooks/useAccessWorkspace"
import type { QueueMode } from "./types"
import { requestColumns } from "./utils/tableColumns"
// Import Modal Components (Assuming Shadcn/UI)
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { revokeAccessRequest } from "./utils/requestApi"

type ReviewQueuePageProps = {
  description: string
  mode: QueueMode
  title: string
}

function ReviewQueuePage({ description, mode, title }: ReviewQueuePageProps) {
  const { errorMessage, isLoading, requests } = useAccessWorkspace(mode)
  const userData = useMemo(() => GetCurrentUser(), [])

  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{
    reqId: number
    itemId: number
  } | null>(null)

  const handleRevokeClick = (reqId: number, itemId: number) => {
    setSelectedItem({ reqId, itemId })
    setIsRevokeModalOpen(true)
  }

  const confirmRevoke = async () => {
    if (!selectedItem || !userData?.employeeId) return

    try {
      await revokeAccessRequest(
        selectedItem.reqId,
        userData.employeeId,
        `Revoking access for Item #${selectedItem.itemId} by IT Team`
      )

      toast.success("Access revoked successfully")
      setIsRevokeModalOpen(false)

      // Suggestion: call refresh() here if your hook provides it
      // to update the UI status immediately.
    } catch (error) {
      console.error("Failed to revoke access", error)
      toast.error("Failed to revoke access")
    }
  }

  return (
    <PageSection title={title} description={description}>
      {errorMessage ? (
        <p className="mb-4 text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <CommonTable
        columns={requestColumns}
        getRowId={(row) => row.accessReqId}
        pageSize={5}
        rows={isLoading ? [] : requests}
        emptyMessage={isLoading ? "Loading..." : "No requests found."}
      />

      {/* Confirmation Modal */}
      <Dialog open={isRevokeModalOpen} onOpenChange={setIsRevokeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Revocation</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke access for this item? This action
              will immediately remove the user's permissions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRevokeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRevoke}>
              Revoke Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageSection>
  )
}

export default ReviewQueuePage
