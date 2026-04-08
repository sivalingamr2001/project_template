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

import type { AccessRequestDetails } from "../../types"
import ReviewItemCard from "./ReviewItemCard"

type ReviewRequestDialogProps = {
  actionType: "approve" | "reject" | null
  details: AccessRequestDetails | null
  isOpen: boolean
  isPending: boolean
  onClose: () => void
  onSubmit: (comments: string, itsrNo: string) => void
  role: "Hod" | "ItTeam"
}

function ReviewRequestDialog({
  actionType,
  details,
  isOpen,
  isPending,
  onClose,
  onSubmit,
  role,
}: ReviewRequestDialogProps) {
  const [comments, setComments] = useState("")
  const [itsrNo, setItsrNo] = useState("")
  const [confirmValues, setConfirmValues] = useState<number[]>([])

  useEffect(() => {
    if (!details) return
    setComments("")
    setItsrNo(details.itsrNo || "")
    setConfirmValues(
      details.items.map((item) =>
        item.accessType === "Read & Write"
          ? 2
          : item.accessType === "Read Only"
            ? 1
            : 0
      )
    )
  }, [details, actionType, isOpen])

  if (!details || !actionType) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-4xl sm:!max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {role === "Hod" ? "HOD Review" : "IT Review"} • Request #
            {details.accessReqId}
          </DialogTitle>
          <DialogDescription>
            {role === "Hod"
              ? "Review the original request. Only confirm access type and comments are editable."
              : "Review the original request. Request fields are read only."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Employee ID">
            <Input disabled value={details.empId} />
          </Field>
          <Field label="Requester">
            <Input disabled value={details.requesterName} />
          </Field>
          <Field label="Department">
            <Input disabled value={details.departmentName} />
          </Field>
        </div>
        <div className="max-h-[42vh] space-y-3 overflow-y-auto">
          {details.items.map((item, index) => (
            <ReviewItemCard
              key={item.accessItemId}
              isHod={role === "Hod"}
              item={item}
              onConfirmChange={(value) =>
                setConfirmValues((current) =>
                  current.map((entry, entryIndex) =>
                    entryIndex === index ? value : entry
                  )
                )
              }
              value={confirmValues[index] ?? 0}
            />
          ))}
        </div>
        {role === "ItTeam" ? (
          <Field label="ITSR Number">
            <Input
              value={itsrNo}
              onChange={(event) => setItsrNo(event.target.value)}
            />
          </Field>
        ) : null}
        <Field label="Comments">
          <Textarea
            className="min-h-28"
            placeholder="Add your review comments"
            value={comments}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setComments(event.target.value)
            }
          />
        </Field>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isPending}
            variant={actionType === "reject" ? "destructive" : "default"}
            onClick={() => onSubmit(comments, itsrNo)}
          >
            {isPending
              ? "Saving..."
              : actionType === "reject"
                ? "Reject"
                : "Approve"}
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
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export default ReviewRequestDialog
