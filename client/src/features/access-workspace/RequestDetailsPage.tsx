import { useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import {
  IconArrowLeft,
  IconCheck,
  IconChevronRight,
  IconClockHour4,
} from "@tabler/icons-react"

import ApprovalReviewModal from "./components/ApprovalReviewModal"
import CreateRequestModal from "./components/CreateRequestModal"
import StageFlow from "./request-details/components/StageFlow"
import TimelineSection from "./request-details/components/TimelineSection"
import { useRequestDetails } from "./request-details/hooks/useRequestDetails"
import { useRequestDetailsPage } from "./request-details/hooks/useRequestDetailsPage"
import RequestReportPanel from "./request-details/report/components/RequestReportPanel"
import {
  formatRequestDate,
  formatRequestDateTime,
} from "./request-details/utils/requestDetails"

function RequestDetailsPage() {
  const navigate = useNavigate()
  const { requestId, itemId } = useParams()
  const { user } = useAuth()
  const accessReqId = Number(requestId)
  const selectedItemFromUrl = itemId ? Number(itemId) : undefined
  const reviewerEmployeeId = user?.employeeId ?? 0
  const role =
    user?.role === "Hod" || user?.role === "ItTeam" ? user.role : "User"
  const { details, errorMessage, isLoading, refetch } = useRequestDetails(
    accessReqId,
    reviewerEmployeeId
  )
  const page = useRequestDetailsPage(details, reviewerEmployeeId, role, refetch)
  const prevItemIdRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (selectedItemFromUrl && selectedItemFromUrl !== prevItemIdRef.current) {
      page.setSelectedItemId(selectedItemFromUrl)
      prevItemIdRef.current = selectedItemFromUrl
    }
  }, [page.setSelectedItemId, selectedItemFromUrl])

  useEffect(() => {
    if (details && !selectedItemFromUrl && page.selectedItemId) {
      navigate(`/requests/${details.accessReqId}/items/${page.selectedItemId}`, {
        replace: true,
      })
    }
  }, [details, navigate, page.selectedItemId, selectedItemFromUrl])

  if (isLoading)
    return (
      <div className="rounded-[0.9rem] border border-border bg-background p-6 text-sm text-muted-foreground">
        Loading request details...
      </div>
    )

  if (!details || !page.selectedItem)
    return (
      <div className="rounded-[0.9rem] border border-border bg-background p-6 text-sm text-destructive">
        {errorMessage || "Request not found."}
      </div>
    )

  const selectedReviewState = page.selectedItemReview

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          className="w-fit px-0"
          size="sm"
          variant="ghost"
          onClick={page.handleBack}
        >
          <IconArrowLeft className="size-4" />
          Back to Requests
        </Button>
        <div className="flex flex-wrap gap-2">
          {page.canResubmit ? (
            <Button onClick={() => page.handleResubmitOpen()}>
              {role === "Hod" ? "Resubmit to IT" : "Resubmit Request"}
            </Button>
          ) : null}
          {page.canReviewAsIt ? (
            <>
              <Button
                variant="outline"
                onClick={() => page.handleReviewOpen("approve")}
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => page.handleReviewOpen("reject")}
              >
                Reject
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <StageFlow status={details.status} />

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <aside className="space-y-4 rounded-[0.9rem] border border-border bg-card p-4 shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold tracking-[0.32em] text-muted-foreground uppercase">
              Parent Record
            </p>
            <h2 className="text-lg font-semibold">Request #{details.accessReqId}</h2>
            <p className="text-sm text-muted-foreground">
              {details.requesterName} • {details.departmentName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/30 p-3 text-sm">
            <Metric label="Status" value={details.status} />
            <Metric label="Overall" value={details.aggregateStatus} />
            <Metric label="ITSR" value={details.itsrNo || "--"} />
            <Metric label="Items" value={String(details.items.length)} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                Child Access Items
              </p>
              {page.canReviewAsHod ? (
                <span className="text-xs text-muted-foreground">
                  {Object.values(page.itemReviews).filter((item) => item.isValidated).length}/
                  {details.items.length} validated
                </span>
              ) : null}
            </div>

            <div className="space-y-2">
              {details.items.map((item, index) => {
                const draft = page.itemReviews[item.accessItemId]
                const isSelected = item.accessItemId === page.selectedItemId
                const statusLabel = draft?.isValidated
                  ? draft.approved
                    ? "Approved"
                    : "Rejected"
                  : "Pending"

                return (
                  <button
                    key={item.accessItemId}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:bg-muted/40"
                    )}
                    onClick={() => {
                      page.setSelectedItemId(item.accessItemId)
                      navigate(
                        `/requests/${details.accessReqId}/items/${item.accessItemId}`
                      )
                    }}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Item {index + 1}
                        </p>
                        <p className="line-clamp-2 text-sm font-semibold">
                          {item.folderPath}
                        </p>
                      </div>
                      <IconChevronRight className="mt-0.5 size-4 text-muted-foreground" />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{item.accessType}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 font-semibold",
                          statusLabel === "Approved" &&
                            "bg-emerald-500/10 text-emerald-600",
                          statusLabel === "Rejected" &&
                            "bg-destructive/10 text-destructive",
                          statusLabel === "Pending" &&
                            "bg-amber-500/10 text-amber-600"
                        )}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {page.canReviewAsHod ? (
            <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-sm font-semibold">HOD Validation Control</p>
              <p className="text-sm text-muted-foreground">
                Review every child access item, then confirm the checklist before
                submitting the HOD decision.
              </p>
              <label className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={page.isValidationConfirmed}
                  disabled={!page.allItemsValidated}
                  onCheckedChange={(checked) =>
                    page.setIsValidationConfirmed(Boolean(checked))
                  }
                />
                <span>
                  I confirm all child access items have been validated.
                </span>
              </label>
              <Button
                className="w-full"
                disabled={
                  page.isPending ||
                  !page.allItemsValidated ||
                  !page.isValidationConfirmed
                }
                onClick={() => void page.handleHodSubmit()}
              >
                {page.isPending ? "Submitting..." : "Submit HOD Review"}
              </Button>
            </div>
          ) : null}
        </aside>

        <div className="space-y-4">
          <RequestReportPanel
            details={{
              ...details,
              items: [{ ...page.selectedItem, isSelected: true }],
            }}
          />

          {page.canReviewAsHod ? (
            <section className="rounded-[0.9rem] border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                    Selected Child Item Review
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">
                    {page.selectedItem.folderPath}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Requested as {page.selectedItem.accessType}. HOD must validate
                    every child item before submission.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => page.handleReviewOpen("approve")}
                  >
                    Approve Item
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => page.handleReviewOpen("reject")}
                  >
                    Reject Item
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <InfoCard
                  icon={IconCheck}
                  label="Validation Status"
                  value={
                    selectedReviewState?.isValidated
                      ? selectedReviewState.approved
                        ? "Approved"
                        : "Rejected"
                      : "Pending validation"
                  }
                />
                <InfoCard
                  icon={IconCheck}
                  label="Confirmed Access"
                  value={
                    selectedReviewState?.confirmAccessType === 2
                      ? "Read & Write"
                      : "Read Only"
                  }
                />
                <InfoCard
                  icon={IconClockHour4}
                  label="Latest Notes"
                  value={selectedReviewState?.comments?.trim() || "No notes added."}
                />
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <section className="rounded-[0.9rem] border border-border bg-card p-5 shadow-sm">
            <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
              Selected Item Snapshot
            </p>
            <div className="mt-4 space-y-4 text-sm">
              <Metric
                label="Requested Access"
                value={page.selectedItem.accessType}
              />
              <Metric
                label="Confirmed Access"
                value={page.selectedItem.confirmAccessType}
              />
              <Metric
                label="HOD Status"
                value={page.selectedItem.hodValidationStatus}
              />
              <Metric
                label="HOD Notes"
                value={page.selectedItem.hodValidationComments || "--"}
              />
              <Metric
                label="Access Granted On"
                value={formatRequestDateTime(page.selectedItem.accessGrantedOn)}
              />
              <Metric
                label="Access Valid Until"
                value={formatRequestDate(page.selectedItem.accessValidUntil)}
              />
            </div>
          </section>

          <TimelineSection timeline={details.timeline} />
        </aside>
      </div>

      <ApprovalReviewModal
        actionType={page.reviewAction}
        details={details}
        isOpen={page.isReviewOpen}
        isPending={page.isPending && role === "ItTeam"}
        item={page.selectedItem}
        onClose={page.handleReviewClose}
        onSubmit={(payload) => {
          if (role === "Hod") {
            page.handleItemReviewSave({
              accessItemId: page.selectedItemId,
              ...payload,
              isValidated: true,
            })
            return
          }

          void page.handleItReview(payload.comments, payload.confirmAccessType)
        }}
        reviewState={
          role === "Hod"
            ? {
                comments: selectedReviewState?.comments ?? "",
                confirmAccessType: selectedReviewState?.confirmAccessType ?? 1,
              }
            : null
        }
        role={role === "Hod" ? "Hod" : "ItTeam"}
      />

      <CreateRequestModal
        initialData={page.resubmitPayload}
        isOpen={page.isResubmitOpen}
        onClose={page.handleResubmitClose}
        onSuccess={page.handleResubmitSuccess}
        submitLabel={role === "Hod" ? "Resubmit to IT" : "Resubmit Request"}
        title={role === "Hod" ? "HOD Resubmit Request" : "Resubmit Request"}
      />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconCheck
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <p className="text-xs tracking-[0.22em] uppercase">{label}</p>
      </div>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  )
}

export default RequestDetailsPage
