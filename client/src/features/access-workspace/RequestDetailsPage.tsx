import { useParams } from "react-router-dom"

import { useAuth } from "@/context/AuthContext"

import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import StageFlow from "./request-details/components/StageFlow"
import TimelineSection from "./request-details/components/TimelineSection"
import { useRequestDetails } from "./request-details/hooks/useRequestDetails"
import { useRequestDetailsPage } from "./request-details/hooks/useRequestDetailsPage"
import RequestReportPanel from "./request-details/report/components/RequestReportPanel"
import CreateRequestModal from "./components/CreateRequestModal"

function RequestDetailsPage() {
  const { requestId } = useParams()
  const { user } = useAuth()
  const accessReqId = Number(requestId)
  const reviewerEmployeeId = user?.employeeId ?? 0
  const role =
    user?.role === "Hod" || user?.role === "ItTeam" ? user.role : "User"
  const { details, errorMessage, isLoading, refetch } = useRequestDetails(
    accessReqId,
    reviewerEmployeeId
  )
  const page = useRequestDetailsPage(details, reviewerEmployeeId, role, refetch)

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
          {"Back to Requests"}
        </Button>
        <div className="flex gap-2">
          {page.canResubmit && (
            <Button onClick={page.handleResubmitOpen}>Resubmit Request</Button>
          )}
          {(page.canReviewAsHod || page.canReviewAsIt) && (
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
          )}
        </div>
      </div>
      <StageFlow status={details.status} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,4fr)_minmax(280px,1fr)]">
        <RequestReportPanel details={details} />
        <TimelineSection timeline={details.timeline} />
      </div>
      <CreateRequestModal
        isOpen={page.isReviewOpen}
        onClose={page.handleReviewClose}
        onSuccess={refetch}
      />
    </div>
  )
}

export default RequestDetailsPage
