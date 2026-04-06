import { useApp } from "@/hooks/useApp"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useData } from "../../context/DataContext"
import { daysBetween, formatDate } from "../../lib/utils"
import { ApprovalTimeline } from "../shared/ApprovalTimeline"
import { AuditLog } from "../shared/AuditLog"
import { StatusBadge } from "../shared/StatusBadge"
import { Button } from "../ui/button"
import DialogPage from "./DialogPage"
import RequestReport from "../shared/Report"

export function RequestDetails() {
  const { requests, addRequest } = useData()
  const {
    currentUser,
    currentRole,
    selectedRequestId,
    selectedAccessItemId,
    setSelectedAccessItemId,
    setCurrentPage,
  } = useApp()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogActionType, setDialogActionType] = useState<"APPROVE" | "REJECT" | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [isResubmitting, setIsResubmitting] = useState(false)

  const request = requests.find((item) => item.id === selectedRequestId)

  if (!request) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Request not found</p>
      </div>
    )
  }

  const handleResubmit = async () => {
    if (!request) return

    setIsResubmitting(true)
    try {
      await addRequest({
        empId: request.requesterId,
        itsrNumber: request.ticketNumber ?? "",
        isAgreed: true,
        details: request.items.map((item) => ({
          folderName: item.system,
          accessType: item.accessType === "ReadAndWrite" ? "Read and Write" : "Read only",
          reason: item.reason ?? request.rejectionReason ?? "Resubmitted request",
          durationDays: Math.max(30, daysBetween(request.requestedAt, item.expiresAt)),
        })),
      })
      toast.success("Request resubmitted successfully")
      setReportOpen(false)
    } catch (error) {
      console.error("Resubmit failed", error)
      toast.error("Unable to resubmit the request")
    } finally {
      setIsResubmitting(false)
    }
  }

  const selectedItem = selectedAccessItemId
    ? request.items.find((item) => item.id === selectedAccessItemId)
    : undefined

  if (!selectedItem) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm text-center">
          <p className="text-lg font-semibold">No access item selected</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This detail page requires a single access item selection. Please open a request from the item-level list.
          </p>
        </div>
      </div>
    )
  }

  const selectedItemTimeline = request.approvalTimeline.filter(
    (record) => record.accessItemId === selectedItem.id
  )
  const itemsMap = new Map(request.items.map((item) => [item.id, item.system]))

  const getWorkflowStatus = (item: typeof selectedItem) => {
    const itemStatuses = item.approvalHistory.map((h) => h.action)

    return {
      hodStageCompleted: item.status !== "PendingHOD",
      itStageCompleted: item.status === "Approved",
      rejectedAtHOD: itemStatuses.includes("HODRejected"),
      rejectedAtIT: itemStatuses.includes("ITRejected"),
    }
  }

  const {
    hodStageCompleted: hodComplete,
    itStageCompleted: itComplete,
    rejectedAtHOD,
    rejectedAtIT,
  } = getWorkflowStatus(selectedItem)

  const stepCards = [
    {
      label: "Request Submitted",
      status: "complete",
      description: "Request created and submitted for approval.",
    },
    {
      label: "HOD Approval",
      status: rejectedAtHOD
        ? "failed"
        : hodComplete
          ? "complete"
          : selectedItem.status === "PendingHOD"
            ? "active"
            : "pending",
      description: "HOD reviews and approves the access item.",
    },
    {
      label: "IT Approval",
      status: rejectedAtIT
        ? "failed"
        : itComplete
          ? "complete"
          : selectedItem.status === "PendingIT"
            ? "active"
            : "pending",
      description: "IT finalizes infrastructure access.",
    },
  ]

  const getStepClasses = (status: string) => {
    if (status === "complete")
      return "border-primary bg-primary text-primary-foreground"
    if (status === "active") return "border border-primary text-primary"
    if (status === "failed")
      return "border-destructive bg-destructive/10 text-destructive"
    return "border border-border text-muted-foreground"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <Button
          variant="outline"
          onClick={() => setReportOpen(true)}
          className="w-full sm:w-auto"
        >
          View Report
        </Button>
      </div>

      <RequestReport
        request={request}
        open={reportOpen}
        onOpenChange={setReportOpen}
        onResubmit={
          request.requesterId === currentUser?.id && request.status === "Rejected"
            ? handleResubmit
            : undefined
        }
        isResubmitting={isResubmitting}
      />

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs tracking-[0.25em] text-muted-foreground uppercase">
              <span>Request ID #{request.id}</span>
              <span className="inline-flex h-1 w-1 rounded-full bg-muted-foreground" />
              <span>Access Item #{selectedItem.id}</span>
            </div>
            <h1 className="text-3xl font-bold">{selectedItem.system}</h1>
            <p className="text-sm text-muted-foreground">
              {selectedItem.accessType} • Requested on {formatDate(selectedItem.requestedAt)}
            </p>
          </div>

          <div className="space-y-4 text-right">
            <StatusBadge status={selectedItem.status} size="lg" />
            <p className="text-sm text-muted-foreground">
              {request.requesterName} • {request.requesterDept}
            </p>
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
                <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
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
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Request ID
                </p>
                <p className="font-semibold">{request.id}</p>
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Requester
                </p>
                <p className="font-semibold">{request.requesterName}</p>
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Department
                </p>
                <p className="font-semibold">{request.requesterDept}</p>
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Submitted
                </p>
                <p className="font-semibold">{formatDate(request.requestedAt)}</p>
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Item count
                </p>
                <p className="font-semibold">{request.items.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Access items</h2>
                <p className="text-sm text-muted-foreground">
                  Each access item is managed independently. Select one to view its full details and approval history.
                </p>
              </div>
              <span className="w-30 rounded-full border border-border bg-muted px-3 py-1 text-xs uppercase text-muted-foreground">
                {request.items.length} items
              </span>
            </div>
            <div className="space-y-3">
              {request.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedAccessItemId(item.id)}
                  className={`group w-full rounded-3xl border p-4 text-left transition ${
                    selectedItem.id === item.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/60 hover:bg-primary/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.system}</p>
                      <p className="text-sm text-muted-foreground">{item.accessType}</p>
                    </div>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Item ID</span>
                      <p>#{item.id}</p>
                    </div>
                    <div>
                      <span className="font-medium">Requested</span>
                      <p>{formatDate(item.requestedAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Selected access item
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{selectedItem.system}</h2>
                <p className="text-sm text-muted-foreground">{selectedItem.accessType}</p>
              </div>
              <StatusBadge status={selectedItem.status} size="lg" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Request ID
                </p>
                <p className="font-semibold">{request.id}</p>
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Access Item
                </p>
                <p className="font-semibold">#{selectedItem.id}</p>
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Requester
                </p>
                <p className="font-semibold">{request.requesterName}</p>
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Department
                </p>
                <p className="font-semibold">{request.requesterDept}</p>
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Expiry
                </p>
                <p className="font-semibold">{formatDate(selectedItem.expiresAt)}</p>
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Requested
                </p>
                <p className="font-semibold">{formatDate(selectedItem.requestedAt)}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Requested Reason
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedItem.reason || "No reason provided for this access item."}
                </p>
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Item Status
                </p>
                <p className="mt-2 font-semibold">{selectedItem.status}</p>
              </div>
            </div>

            {(currentRole === "HOD" && selectedItem.status === "PendingHOD") ||
            (currentRole === "IT" && selectedItem.status === "PendingIT") ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedAccessItemId(selectedItem.id)
                    setDialogActionType("REJECT")
                    setIsDialogOpen(true)
                  }}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setSelectedAccessItemId(selectedItem.id)
                    setDialogActionType("APPROVE")
                    setIsDialogOpen(true)
                  }}
                >
                  Approve
                </Button>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Approval Timeline</h2>
            <ApprovalTimeline
              timeline={selectedItemTimeline}
              compact
              itemsMap={itemsMap}
            />
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Audit Log</h2>
            <AuditLog request={request} selectedItemId={selectedItem.id} />
          </div>
        </div>
      </div>

      <DialogPage
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        actionType={dialogActionType}
        onActionTypeChange={setDialogActionType}
      />

      {request.rejectionReason && (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/10 p-6 text-destructive shadow-sm">
          <p className="mb-2 font-semibold">Rejection Reason</p>
          <p className="text-sm">{request.rejectionReason}</p>
        </div>
      )}
    </div>
  )
}
