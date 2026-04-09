import { useEffect, useState, type ChangeEvent } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { AccessRequestDetails, AccessRequestItem } from "../types"

type ApprovalReviewModalProps = {
  actionType: "approve" | "reject" | null
  details: AccessRequestDetails | null
  isOpen: boolean
  isPending: boolean
  item: AccessRequestItem | null
  onClose: () => void
  onSubmit: (payload: {
    approved: boolean
    comments: string
    confirmAccessType: number
  }) => void
  role: "Hod" | "ItTeam"
  reviewState?: {
    comments: string
    confirmAccessType: number
  } | null
}

function ApprovalReviewModal({
  actionType,
  details,
  isOpen,
  isPending,
  item,
  onClose,
  onSubmit,
  role,
  reviewState,
}: ApprovalReviewModalProps) {
  const [comments, setComments] = useState("")
  const [confirmAccessType, setConfirmAccessType] = useState<number>(1)

  useEffect(() => {
    if (!item) return

    setComments(reviewState?.comments ?? "")
    setConfirmAccessType(
      reviewState?.confirmAccessType ??
        (item.confirmAccessType === "Read & Write" ||
        item.accessType === "Read & Write"
          ? 2
          : 1)
    )
  }, [actionType, isOpen, item, reviewState])

  if (!details || !actionType || !item) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {role === "Hod" ? "Validate Child Access Item" : "Review Access Request"}{" "}
            #{details.accessReqId}
          </DialogTitle>
          <DialogDescription>
            {actionType === "approve"
              ? role === "Hod"
                ? "Confirm the final access type for this child item and mark it as validated."
                : "Approve this request to grant access for all validated child items."
              : role === "Hod"
                ? "Reject this child item and record the reason."
                : "Reject this request and record the IT review comment."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Employee ID">
            <Input disabled value={details.empId} />
          </Field>
          <Field label="Requester">
            <Input disabled value={details.requesterName} />
          </Field>
          <Field label="Folder Path">
            <Input disabled value={item.folderPath} />
          </Field>
          <Field label="Requested Access Type">
            <Input disabled value={item.accessType} />
          </Field>
        </div>

        <Field label="Reason">
          <Textarea disabled rows={3} value={item.reason} />
        </Field>

        {role === "Hod" ? (
          <Field label="Confirm Access Type">
            <Select
              value={String(confirmAccessType)}
              onValueChange={(value) => setConfirmAccessType(Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Read Only</SelectItem>
                <SelectItem value="2">Read & Write</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        ) : null}

        <Field
          label={
            actionType === "reject"
              ? "Comments"
              : role === "Hod"
                ? "Validation Notes"
                : "IT Comments"
          }
        >
          <Textarea
            className="min-h-28"
            placeholder={
              actionType === "reject"
                ? "Comments are required for rejection."
                : "Optional notes"
            }
            value={comments}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setComments(event.target.value)
            }
          />
        </Field>

        <div className="flex justify-end gap-3">
          <Button disabled={isPending} variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isPending || (actionType === "reject" && !comments.trim())}
            variant={actionType === "reject" ? "destructive" : "default"}
            onClick={() =>
              onSubmit({
                approved: actionType === "approve",
                comments,
                confirmAccessType,
              })
            }
          >
            {isPending
              ? "Saving..."
              : actionType === "approve"
                ? role === "Hod"
                  ? "Save Validation"
                  : "Approve Request"
                : role === "Hod"
                  ? "Reject Item"
                  : "Reject Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold">{label}</Label>
      {children}
    </div>
  )
}

export default ApprovalReviewModal
