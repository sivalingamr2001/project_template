import type { ITQueueItem } from '../it.types'
import { CommonTable } from '../../shared/CommonTable'
import { QueueActions } from './QueueActions'
import { updateAccessApproval } from '@/lib/access-request-api'
import { useApp } from '@/hooks/useApp'
import { useState } from 'react'
import { toast } from 'sonner'

export function QueueTable(props: {
  data: ITQueueItem[]
  isLoading: boolean
  onReload: () => Promise<void> | void
  onView: (id: number) => void
}) {
  const { currentUser } = useApp()
  const [pendingId, setPendingId] = useState<number | null>(null)

  return (
    <CommonTable<ITQueueItem>
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
      ]}
      renderRowActions={(row) => (
        <QueueActions
          requestId={row.requestId}
          detailId={row.detailId}
          approvalId={row.approvalId}
          employeeName={row.employeeName}
          empId={row.empId}
          folderName={row.folderName}
          accessType={row.accessType}
          status={row.status}
          mode="IT"
          isPending={pendingId === row.approvalId}
          onApprove={async ({ requestId, detailId, approvalId, comment }) => {
            try {
              setPendingId(approvalId)
              await updateAccessApproval({
                requestId,
                detailId,
                approvalId,
                approverEmpId: currentUser?.employeeId ?? currentUser?.id ?? 0,
                approvalLevel: "IT",
                status: "Approved",
                comments: comment,
              })
              toast.success("IT approval submitted")
              await props.onReload()
            } catch (error) {
              console.error("Failed to approve request", error)
              toast.error("Failed to submit IT approval")
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
                approvalLevel: "IT",
                status: "Rejected",
                comments: reason,
              })
              toast.success("IT rejection submitted")
              await props.onReload()
            } catch (error) {
              console.error("Failed to reject request", error)
              toast.error("Failed to submit IT rejection")
            } finally {
              setPendingId(null)
            }
          }}
        />
      )}
      rowToSearchString={(row) => [row.employeeName, row.folderName, row.accessType].join(' ')}
      onRefresh={props.onReload}
      emptyMessage="No queue items"
      searchPlaceholder="Search queue"
    />
  )
}
