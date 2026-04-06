import type { HODAccessTypes } from "@/lib/types"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Textarea } from "../ui/textarea"

import React, { useState } from "react"
import { useData } from "@/context/DataContext"
import { useApp } from "@/hooks/useApp"
import { daysBetween } from "@/lib/utils"

const hodApprovalOptions: Array<{ value: HODAccessTypes; label: string }> = [
  { value: "ReadOnly", label: "Read Only" },
  { value: "ReadAndWrite", label: "Read and Write" },
  { value: "HodOnly", label: "HOD Only" },
]

interface DialogPageProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionType: "APPROVE" | "REJECT" | null
  onActionTypeChange: (type: "APPROVE" | "REJECT" | null) => void
}

function DialogPage({
  open,
  onOpenChange,
  actionType,
  onActionTypeChange,
}: DialogPageProps) {
  const { requests, approveItem, rejectItem } = useData()
  const { currentRole, selectedRequestId, selectedAccessItemId, setSelectedAccessItemId } = useApp()
  const [comment, setComment] = useState("")

  const request = requests.find((item) => item.id === selectedRequestId)

  const [tempTypes, setTempTypes] = useState<Record<number, HODAccessTypes>>({})
  const [tempDurations, setTempDurations] = useState<Record<number, number>>({})

  const displayTypes = request
    ? Object.fromEntries(
        request.items.map((item) => [
          item.id,
          tempTypes[item.id] ?? (item.accessType as HODAccessTypes),
        ])
      )
    : {}

  const displayDurations = request
    ? Object.fromEntries(
        request.items.map((item) => [
          item.id,
          tempDurations[item.id] ??
            Math.max(1, daysBetween(request.requestedAt, item.expiresAt)),
        ])
      )
    : {}

  if (!request) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Request not found</p>
      </div>
    )
  }

  const selectedItemId = selectedAccessItemId ?? null
  const selectedItem = selectedItemId
    ? request.items.find((item) => item.id === selectedItemId)
    : undefined

  const closeActionDialog = () => {
    onOpenChange(false)
    onActionTypeChange(null)
    setComment("")
  }

  const getNextPendingItemId = (currentItemId: number) => {
    const pendingStatus = currentRole === "HOD" ? "PendingHOD" : "PendingIT"
    const currentIndex = request.items.findIndex(
      (item) => item.id === currentItemId
    )
    const nextItemAfterCurrent = request.items
      .slice(currentIndex + 1)
      .find((item) => item.status === pendingStatus)

    if (nextItemAfterCurrent) {
      return nextItemAfterCurrent.id
    }

    return request.items.find((item) => item.status === pendingStatus)?.id
  }

  const handleActionSubmit = async () => {
    if (!actionType || selectedItemId === null) return

    if (actionType === "APPROVE") {
      await approveItem(
        request.id,
        selectedItemId,
        comment.trim(),
        undefined,
        displayTypes[selectedItemId],
        displayDurations[selectedItemId]
      )
    }

    if (actionType === "REJECT") {
      await rejectItem(request.id, selectedItemId, comment.trim())
    }

    const nextPendingItemId = getNextPendingItemId(selectedItemId)
    setSelectedAccessItemId(nextPendingItemId)
    closeActionDialog()
  }

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onOpenChange={(value) =>
          value ? onOpenChange(true) : closeActionDialog()
        }
      >
        <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-6 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === "APPROVE" ? "Approve Request" : "Reject Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "APPROVE"
                ? currentRole === "HOD"
                  ? "Confirm the request details and approve the access request."
                  : "Add comments and approve the request for IT activation."
                : "Provide a reason for rejecting this request."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="dialog-request-id">Request ID</Label>
                <Input id="dialog-request-id" value={request.id} disabled />
              </div>
              <div>
                <Label htmlFor="dialog-requester">Requester</Label>
                <Input
                  id="dialog-requester"
                  value={request.requesterName}
                  disabled
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="dialog-department">Department</Label>
                <Input
                  id="dialog-department"
                  value={request.requesterDept}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="dialog-status">Current Status</Label>
                <Input id="dialog-status" value={request.status} disabled />
              </div>
            </div>

            {selectedItem ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold">Selected Access Item</p>
                <div className="rounded-2xl border border-border p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="dialog-item-system">System</Label>
                      <Input
                        id="dialog-item-system"
                        value={selectedItem.system}
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="dialog-requested-access">
                        Requested Access
                      </Label>
                      <Input
                        id="dialog-requested-access"
                        value={selectedItem.accessType}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="dialog-item-approved-access">
                        Approved Access
                      </Label>
                      <Select
                        value={displayTypes[selectedItem.id]}
                        onValueChange={(value) =>
                          setTempTypes((prev) => ({
                            ...prev,
                            [selectedItem.id]: value as HODAccessTypes,
                          }))
                        }
                        disabled={currentRole !== "HOD"}
                      >
                        <SelectTrigger
                          id="dialog-item-approved-access"
                          className="w-full"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {hodApprovalOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dialog-item-duration">
                        Duration (Days)
                      </Label>
                      <Input
                        id="dialog-item-duration"
                        type="number"
                        min={1}
                        value={displayDurations[selectedItem.id] ?? 1}
                        onChange={(event) =>
                          setTempDurations((prev) => ({
                            ...prev,
                            [selectedItem.id]:
                              parseInt(event.target.value, 10) || 1,
                          }))
                        }
                        disabled={currentRole !== "HOD"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div>
              <Label htmlFor="dialog-comments">Comments</Label>
              <Textarea
                id="dialog-comments"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                placeholder={
                  actionType === "REJECT"
                    ? "Add rejection reason..."
                    : "Add approval comments..."
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog}>
              Cancel
            </Button>
            <Button
              variant={actionType === "REJECT" ? "destructive" : "default"}
              disabled={actionType === "REJECT" && !comment.trim()}
              onClick={() => {
                void handleActionSubmit()
              }}
            >
              {actionType === "REJECT" ? "Reject" : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  )
}

export default DialogPage
