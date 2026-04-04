import type { ApprovalItem } from '../hod.types'
import { CommonTable } from '../../shared/CommonTable'
import { Button } from '../../ui/button'
import { useData } from '../../../context/DataContext'

export function PendingTable(props: {
  data: ApprovalItem[]
  isLoading: boolean
  onView: (id: number) => void
}) {
  const { refreshData } = useData()

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
        <Button size="sm" variant="outline" onClick={() => props.onView(row.requestId)}>
          View
        </Button>
      )}
      rowToSearchString={(row) => [row.employeeName, row.folderName, row.accessType, row.status].join(' ')}
      onRefresh={refreshData}
      emptyMessage="No pending requests"
      searchPlaceholder="Search approvals"
    />
  )
}
