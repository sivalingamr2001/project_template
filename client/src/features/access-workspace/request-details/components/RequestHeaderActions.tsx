import { Button } from "@/components/ui/button"

type RequestHeaderActionsProps = {
  canResubmit: boolean
  onResubmitOpen: () => void
}

function RequestHeaderActions({
  canResubmit,
  onResubmitOpen,
}: RequestHeaderActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {canResubmit ? (
        <Button size="sm" variant="secondary" onClick={onResubmitOpen}>
          Edit & Resubmit
        </Button>
      ) : null}
    </div>
  )
}

export default RequestHeaderActions
