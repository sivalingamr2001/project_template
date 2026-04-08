import { Button } from "@/components/ui/button"

type ApprovalActionsProps = {
  canReviewAsHod: boolean
  canReviewAsIt: boolean
  isPending: boolean
  onApprove: () => void
  onReject: () => void
}

function ApprovalActions({
  canReviewAsHod,
  canReviewAsIt,
  isPending,
  onApprove,
  onReject,
}: ApprovalActionsProps) {
  const isVisible = canReviewAsHod || canReviewAsIt
  const title = canReviewAsHod ? "HOD Approval" : "IT Approval"

  if (!isVisible) return null

  return (
    <section className="rounded-[0.9rem] border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Open the review dialog to inspect the request and complete this stage.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button disabled={isPending} onClick={onApprove}>
          {isPending ? "Saving..." : "Approve"}
        </Button>
        <Button disabled={isPending} variant="destructive" onClick={onReject}>
          Reject
        </Button>
      </div>
    </section>
  )
}

export default ApprovalActions
