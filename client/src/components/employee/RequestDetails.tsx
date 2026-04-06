import { useState } from "react"
import { useData } from "../../context/DataContext"
import { useApp } from "@/hooks/useApp"
import { StatusBadge } from "../shared/StatusBadge"
import { AuditLog } from "../shared/AuditLog"
import { ApprovalTimeline } from "../shared/ApprovalTimeline"
import { formatDate, getDaysUntilExpiry } from "../../lib/utils"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import type { AccessTypes } from "@/lib/types"

const accessTypeOptions: Array<{ value: AccessTypes; label: string }> = [
  { value: "NotApplicable", label: "Not Applicable" },
  { value: "ReadOnly", label: "Read Only" },
  { value: "ReadAndWrite", label: "Read and Write" },
]

export function RequestDetails() {
  const { requests, approveItem, rejectItem } = useData()
  const { currentRole, selectedRequestId, setCurrentPage } = useApp()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null)
  const [comment, setComment] = useState("")

  const request = requests.find((item) => item.id === selectedRequestId)

  const [confirmedTypes, setConfirmedTypes] = useState<Record<number, AccessTypes>>(() => {
    if (!request) return {}
    return Object.fromEntries(request.items.map((item) => [item.id, item.accessType]))
  })

  if (!request) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Request not found</p>
      </div>
    )
  }

  const hodStageCompleted = ["PendingIT", "Approved"].includes(request.status)
  const itStageCompleted = ["Approved"].includes(request.status)
  const isRejected = request.status === "Rejected"

  const actionableItems = request.items.filter((item) => {
    if (currentRole === "HOD") return item.status === "PendingHOD"
    if (currentRole === "IT") return item.status === "PendingIT"
    return false
  })

  const canTakeAction = actionableItems.length > 0

  const closeActionDialog = () => {
    setIsDialogOpen(false)
    setActionType(null)
    setComment("")
  }

  const handleActionSubmit = async () => {
    if (!actionType) return

    if (actionType === "APPROVE") {
      for (const item of actionableItems) {
        await approveItem(request.id, item.id, comment.trim(), confirmedTypes[item.id])
      }
    }

    if (actionType === "REJECT") {
      for (const item of actionableItems) {
        await rejectItem(request.id, item.id, comment.trim())
      }
    }

    closeActionDialog()
  }

  const stepCards = [
    {
      label: "Request Submitted",
      status: "complete",
      description: "Request created and submitted for approval.",
    },
    {
      label: "HOD Approval",
      status:
        isRejected && !hodStageCompleted
          ? "failed"
          : hodStageCompleted
            ? "complete"
            : request.status === "PendingHOD"
              ? "active"
              : "pending",
      description: "HOD reviews and approves the request.",
    },
    {
      label: "IT Approval",
      status:
        isRejected && hodStageCompleted
          ? "failed"
          : itStageCompleted
            ? "complete"
            : request.status === "PendingIT"
              ? "active"
              : "pending",
      description: "IT finalizes infrastructure access.",
    },
  ]

  const getStepClasses = (status: string) => {
    if (status === "complete") return "border-primary bg-primary text-primary-foreground"
    if (status === "active") return "border border-primary text-primary"
    if (status === "failed") return "border-destructive bg-destructive/10 text-destructive"
    return "border border-border text-muted-foreground"
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() =>
          setCurrentPage(
            currentRole === "HOD"
              ? "HOD_APPROVALS"
              : currentRole === "IT"
                ? "IT_QUEUE"
                : "EMPLOYEE_DASHBOARD"
          )
        }
        className="flex items-center gap-2 text-primary hover:underline"
      >
        <ArrowLeft size={18} />
        Back to Requests
      </button>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              <span>Employee Request</span>
              <span className="inline-flex h-1 w-1 rounded-full bg-muted-foreground" />
              <span>File Server Folder Access</span>
            </div>
            <h1 className="text-3xl font-bold">Access Request #{request.id}</h1>
            <p className="text-sm text-muted-foreground">
              Requested on {formatDate(request.requestedAt)} by {request.requesterName}
            </p>
            <p className="text-sm text-muted-foreground">Department: {request.requesterDept}</p>
          </div>

          <div className="space-y-4">
            <StatusBadge status={request.status} size="lg" />
            {canTakeAction && (
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => { setActionType("REJECT"); setIsDialogOpen(true) }}>
                  Reject
                </Button>
                <Button onClick={() => { setActionType("APPROVE"); setIsDialogOpen(true) }}>
                  Approve
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {stepCards.map((step, index) => (
            <div
              key={step.label}
              className={`rounded-2xl border p-4 shadow-sm transition ${getStepClasses(step.status)}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-current text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {step.status === "complete"
                    ? "Completed"
                    : step.status === "active"
                      ? "In progress"
                      : step.status === "failed"
                        ? "Failed"
                        : "Pending"}
                </span>
              </div>
              <h2 className="mt-4 text-base font-semibold">{step.label}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Request ID</p>
              <p className="font-semibold">{request.id}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
              <p className="font-semibold">{request.status}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Requester</p>
              <p className="font-semibold">{request.requesterName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Department</p>
              <p className="font-semibold">{request.requesterDept}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total Items</p>
              <p className="font-semibold">{request.items.length}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Requested</p>
              <p className="font-semibold">{formatDate(request.requestedAt)}</p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold">Access Items</h2>
            <div className="space-y-3">
              {request.items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{item.system}</p>
                      <p className="text-sm text-muted-foreground">{item.accessType}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-4 grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em]">Requested At</p>
                      <p className="mt-1 text-foreground">{formatDate(item.requestedAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em]">Expiry</p>
                      <p className="mt-1 text-foreground">{formatDate(item.expiresAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em]">Days Left</p>
                      <p className="mt-1 text-foreground">{getDaysUntilExpiry(item)}</p>
                    </div>
                  </div>
                  {getDaysUntilExpiry(item) < 30 && getDaysUntilExpiry(item) > 0 && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-700">
                      <AlertCircle size={16} />
                      This access expires soon.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Approval Timeline</h2>
            <ApprovalTimeline timeline={request.approvalTimeline} compact />
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Audit Log</h2>
            <AuditLog request={request} />
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(value) => (value ? setIsDialogOpen(true) : closeActionDialog())}>
        <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-6 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{actionType === "APPROVE" ? "Approve Request" : "Reject Request"}</DialogTitle>
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
                <Input id="dialog-requester" value={request.requesterName} disabled />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="dialog-department">Department</Label>
                <Input id="dialog-department" value={request.requesterDept} disabled />
              </div>
              <div>
                <Label htmlFor="dialog-status">Current Status</Label>
                <Input id="dialog-status" value={request.status} disabled />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Access Items</p>
              <div className="space-y-3">
                {request.items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`dialog-item-system-${item.id}`}>System</Label>
                        <Input id={`dialog-item-system-${item.id}`} value={item.system} disabled />
                      </div>
                      <div>
                        <Label htmlFor={`dialog-item-access-${item.id}`}>Access Type</Label>
                        <Select
                          value={confirmedTypes[item.id] ?? item.accessType}
                          onValueChange={(value) =>
                            setConfirmedTypes((prev) => ({
                              ...prev,
                              [item.id]: value as AccessTypes,
                            }))
                          }
                          disabled={currentRole === "IT"}
                        >
                          <SelectTrigger id={`dialog-item-access-${item.id}`} className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {accessTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="dialog-comments">Comments</Label>
              <Textarea
                id="dialog-comments"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                placeholder={
                  actionType === "REJECT" ? "Add rejection reason..." : "Add approval comments..."
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

      {request.rejectionReason && (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/10 p-6 text-destructive shadow-sm">
          <p className="mb-2 font-semibold">Rejection Reason</p>
          <p className="text-sm">{request.rejectionReason}</p>
        </div>
      )}
    </div>
  )
}
