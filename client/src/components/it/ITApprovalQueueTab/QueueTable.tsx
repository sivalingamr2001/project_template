import type { ITQueueItem } from '../it.types'
import { CommonTable } from '../../shared/CommonTable'
import { Button } from '../../ui/button'
import { useData } from '../../../context/DataContext'

export function QueueTable(props: {
  data: ITQueueItem[]
  isLoading: boolean
  onView: (requestId: number, accessItemId?: number) => void
}) {
  const { refreshData } = useData()

  return (
    <CommonTable<ITQueueItem>
      data={props.data}
      isLoading={props.isLoading}
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
          header: 'Approved By',
          cell: (row) => row.approvedBy ?? '-',
        },
      ]}
      renderRowActions={(row) => (
        <Button size="sm" variant="default" onClick={() => props.onView(row.requestId, row.id)}>
          View
        </Button>
      )}
      rowToSearchString={(row) => [row.employeeName, row.folderName, row.accessType].join(' ')}
      onRefresh={refreshData}
      emptyMessage="No queue items"
      searchPlaceholder="Search queue"
    />
  )
}
