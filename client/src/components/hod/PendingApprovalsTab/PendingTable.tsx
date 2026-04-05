import type { ApprovalItem } from '../hod.types'
import { CommonTable } from '../../shared/CommonTable'
import { ApproveRejectActions } from './ApproveRejectActions'
import { updateAccessApproval } from '@/lib/access-request-api'
import { useApp } from '@/hooks/useApp'
import { useState } from 'react'
import { toast } from 'sonner'

export function PendingTable(props: {
  data: ApprovalItem[]
  isLoading: boolean
  onReload: () => Promise<void> | void
  onView: (id: number) => void
}) {
  const { currentUser } = useApp()
  const [pendingId, setPendingId] = useState<number | null>(null)

  return (
    <CommonTable<ApprovalItem>
      data={props.data}
      isLoading={props.isLoading}
      rowKey={(row) => row.id}
      columns={[
        {
          header: 'Employee',
          cell: (row) => row.employeeName,
        },
        {
          header: 'Folder',
          cell: (row) => row.folderName,
        },
        {
          header: 'Access',
          cell: (row) => row.accessType,
        },
        {
          header: 'Status',
          cell: (row) => row.status,
        },
      ]}
      renderRowActions={(row) => (
        <ApproveRejectActions
          requestId={row.requestId}
          detailId={row.detailId}
          approvalId={row.approvalId}
          employeeName={row.employeeName}
          empId={row.empId}
          folderName={row.folderName}
          accessType={row.accessType}
          status={row.status}
          mode="HOD"
          isPending={pendingId === row.approvalId}
          onApprove={async ({ requestId, detailId, approvalId, comment }) => {
            try {
              setPendingId(approvalId)
              await updateAccessApproval({
                requestId,
                detailId,
                approvalId,
                approverEmpId: currentUser?.employeeId ?? currentUser?.id ?? 0,
                approvalLevel: "HOD",
                status: "Approved",
                comments: comment,
              })
              toast.success("HOD approval submitted")
              await props.onReload()
            } catch (error) {
              console.error("Failed to approve request", error)
              toast.error("Failed to submit HOD approval")
            } finally {
              setPendingId(null)
            }
          }}
          onReject={async ({ requestId, detailId, approvalId, reason }) => {
            try {
              setPendingId(approvalId)
              await updateAccessApproval({
                requestId,
                detailId,
                approvalId,
                approverEmpId: currentUser?.employeeId ?? currentUser?.id ?? 0,
                approvalLevel: "HOD",
                status: "Rejected",
                comments: reason,
              })
              toast.success("HOD rejection submitted")
              await props.onReload()
            } catch (error) {
              console.error("Failed to reject request", error)
              toast.error("Failed to submit HOD rejection")
            } finally {
              setPendingId(null)
            }
          }}
        />
      )}
      rowToSearchString={(row) => [row.employeeName, row.folderName, row.accessType, row.status].join(' ')}
      onRefresh={props.onReload}
      emptyMessage="No pending requests"
      searchPlaceholder="Search approvals"
    />
  )
}
