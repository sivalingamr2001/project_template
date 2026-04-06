// Placeholder components - will be implemented based on existing components
export function ITAllRequestsTable({
  data,
  isLoading,
  onView,
}: {
  data: any[]
  isLoading: boolean
  onView: (requestId: number, itemId: number) => void
}) {
  return <div>IT All Requests Table - TODO</div>
}

export function ITApprovalQueueTable({
  data,
  isLoading,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  data: any[]
  isLoading: boolean
  onApprove: (requestId: number, itemId: number, options?: any) => void
  onReject: (requestId: number, itemId: number, reason: string) => void
  isApproving: boolean
  isRejecting: boolean
}) {
  return <div>IT Approval Queue Table - TODO</div>
}
