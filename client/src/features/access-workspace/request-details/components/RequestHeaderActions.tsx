import { Button } from "@/components/ui/button"

type RequestHeaderActionsProps = {
  canResubmit: boolean
  canReviewAsHod: boolean
  canReviewAsIt: boolean
  onResubmitOpen: () => void
  onReviewOpen: (action: "approve" | "reject") => void
}

function RequestHeaderActions({
  canResubmit,
  canReviewAsHod,
  canReviewAsIt,
  onResubmitOpen,
  onReviewOpen,
}: RequestHeaderActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* User: Edit & Resubmit */}
      {canResubmit && (
        <Button size="sm" variant="secondary" onClick={onResubmitOpen}>
          Edit & Resubmit
        </Button>
      )}

      {/* HOD/IT: Approve & Reject */}
      {(canReviewAsHod || canReviewAsIt) && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReviewOpen("approve")}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onReviewOpen("reject")}
          >
            Reject
          </Button>
        </>
      )}
    </div>
  )
}

export default RequestHeaderActions
