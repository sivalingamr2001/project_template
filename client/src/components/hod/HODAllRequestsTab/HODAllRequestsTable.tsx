import type { ApprovalItem } from '../hod.types'
import { StatusBadge } from '../../shared/StatusBadge'
import { CommonTable } from '../../shared/CommonTable'
import { Button } from '../../ui/button'
import { useData } from '../../../context/DataContext'

export function HODAllRequestsTable({ data, isLoading, onView }: { data: ApprovalItem[]; isLoading: boolean; onView: (requestId: number, itemId: number) => void }) {
  const { refreshData } = useData()

  return (
    <CommonTable<ApprovalItem>
      data={data}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      columns={[
        {
          header: 'Employee',
          cell: (row) => (
            <div>
              <div>{row.employeeName}</div>
              <div className="text-xs text-muted-foreground">
                {row.requesterCode ?? row.empId}
                {row.requesterEmail ? ` • ${row.requesterEmail}` : ""}
              </div>
            </div>
          ),
        },
        {
          header: 'Department',
          cell: (row) => (
            <div>
              <div>{row.department ?? "-"}</div>
              <div className="text-xs text-muted-foreground">
                HOD: {row.hodName ?? "-"}
              </div>
            </div>
          ),
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
          cell: (row) => <StatusBadge status={row.status} size="sm" />,
        },
        {
          header: 'Requested',
          cell: (row) => row.requestedAt ? new Date(row.requestedAt).toLocaleString() : '-',
        },
      ]}
      renderRowActions={(row) => (
        <Button size="sm" variant="outline" onClick={() => onView(row.requestId, row.detailId)}>
          View
        </Button>
      )}
      rowToSearchString={(row) => [row.employeeName, row.folderName, row.accessType, row.status].join(' ')}
      onRefresh={refreshData}
      emptyMessage="No requests found"
      searchPlaceholder="Search all requests"
    />
  )
}