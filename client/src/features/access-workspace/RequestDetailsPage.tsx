import { useParams } from "react-router-dom"

import { useAuth } from "@/context/AuthContext"

import RequestHeader from "./request-details/components/RequestHeader"
import RequestHeaderActions from "./request-details/components/RequestHeaderActions"
import StageFlow from "./request-details/components/StageFlow"
import TimelineSection from "./request-details/components/TimelineSection"
import { useRequestDetails } from "./request-details/hooks/useRequestDetails"
import { useRequestDetailsPage } from "./request-details/hooks/useRequestDetailsPage"
import RequestReportPanel from "./request-details/report/components/RequestReportPanel"

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
      <RequestHeader
        accessReqId={details.accessReqId}
        action={
          <RequestHeaderActions
            canResubmit={page.canResubmit}
            onResubmitOpen={page.handleResubmitOpen}
          />
        }
        onBack={page.handleBack}
        status={details.status}
      />
      <StageFlow status={details.status} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,4fr)_minmax(280px,1fr)]">
        <RequestReportPanel details={details} />
        <TimelineSection timeline={details.timeline} />
      </div>
    </div>
  )
}

export default RequestDetailsPage
