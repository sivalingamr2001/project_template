import { useState } from "react"
import { useData } from "@/context/DataContext"
import { useApp } from "@/context/AppContext"
import type { HODAccessTypes } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RequestInfoGrid } from "./RequestInfoGrid"
import { SelectedItemSection } from "./SelectedItemSection"
import { getDisplayDurations, getNextPendingItemId } from "./utils"
import type { DialogPageProps, TempDurationsMap, TempTypesMap } from "./types"

export default function DialogPage({ open, onOpenChange, actionType, onActionTypeChange }: DialogPageProps) {
  const { requests, approveItem, rejectItem } = useData()
  const { currentRole, selectedRequestId, selectedAccessItemId, setSelectedAccessItemId } = useApp()
  const [comment, setComment] = useState("")
  const [tempTypes, setTempTypes] = useState<TempTypesMap>({})
  const [tempDurations, setTempDurations] = useState<TempDurationsMap>({})
  const request = requests.find((item) => item.id === selectedRequestId)
  if (!request) return <div className="py-8 text-center"><p className="text-muted-foreground">Request not found</p></div>
  const displayTypes = Object.fromEntries(request.items.map((item) => [item.id, tempTypes[item.id] ?? (item.accessType as HODAccessTypes)]))
  const displayDurations = getDisplayDurations(request, tempDurations)
  const selectedItemId = selectedAccessItemId ?? null
  const selectedItem = selectedItemId ? request.items.find((item) => item.id === selectedItemId) : undefined
  const closeActionDialog = () => { onOpenChange(false); onActionTypeChange(null); setComment("") }
  const handleSubmit = async () => {
    if (!actionType || selectedItemId === null) return
    if (actionType === "APPROVE") await approveItem(request.id, selectedItemId, comment.trim(), undefined, displayTypes[selectedItemId], displayDurations[selectedItemId])
    if (actionType === "REJECT") await rejectItem(request.id, selectedItemId, comment.trim())
    setSelectedAccessItemId(getNextPendingItemId(request, currentRole, selectedItemId))
    closeActionDialog()
  }
  const dialogTitle = actionType === "APPROVE" ? "Approve Request" : "Reject Request"
  const dialogDescription = actionType === "APPROVE" ? (currentRole === "HOD" ? "Confirm the request details and approve the access request." : "Add comments and approve the request for IT activation.") : "Provide a reason for rejecting this request."

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? onOpenChange(true) : closeActionDialog())}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-6 sm:max-w-2xl">
        <DialogHeader><DialogTitle>{dialogTitle}</DialogTitle><DialogDescription>{dialogDescription}</DialogDescription></DialogHeader>
        <div className="space-y-4 py-4">
          <RequestInfoGrid request={request} />
          {selectedItem ? <SelectedItemSection selectedItem={selectedItem} currentRole={currentRole} approvedAccess={displayTypes[selectedItem.id]} durationDays={displayDurations[selectedItem.id] ?? 1} onAccessTypeChange={(value) => setTempTypes((prev) => ({ ...prev, [selectedItem.id]: value }))} onDurationChange={(value) => setTempDurations((prev) => ({ ...prev, [selectedItem.id]: value }))} /> : null}
          <div>
            <Label htmlFor="dialog-comments">Comments</Label>
            <Textarea id="dialog-comments" value={comment} onChange={(event) => setComment(event.target.value)} rows={4} placeholder={actionType === "REJECT" ? "Add rejection reason..." : "Add approval comments..."} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeActionDialog}>Cancel</Button>
          <Button variant={actionType === "REJECT" ? "destructive" : "default"} disabled={actionType === "REJECT" && !comment.trim()} onClick={() => void handleSubmit()}>
            {actionType === "REJECT" ? "Reject" : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

