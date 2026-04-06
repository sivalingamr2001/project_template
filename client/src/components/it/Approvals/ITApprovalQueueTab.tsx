import { useITQueue } from "./hooks/useITQueue"
import { useITApprove } from "./hooks/useITApprove"
import { useITReject } from "./hooks/useITReject"
import { ITApprovalQueueTable } from "./components/ITApprovalQueueTable"

export function ITApprovalQueueTab() {
  const { data, isLoading } = useITQueue()
  const approveMutation = useITApprove()
  const rejectMutation = useITReject()

  return (
    <ITApprovalQueueTable
      data={data}
      isLoading={isLoading}
      onApprove={approveMutation.mutate}
      onReject={rejectMutation.mutate}
      isApproving={approveMutation.isPending}
      isRejecting={rejectMutation.isPending}
    />
  )
}
