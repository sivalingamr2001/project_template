import type { ApprovalItem } from '../hod.types'
import { StatusBadge } from '../../shared/StatusBadge'
import { CommonTable } from '../../shared/CommonTable'
import { Button } from '../../ui/button'
import { useData } from '../../../context/DataContext'

export function HistoryTable({ data, isLoading, onView }: { data: ApprovalItem[]; isLoading: boolean; onView: (requestId: number, itemId: number) => void }) {
  const { refreshData } = useData()

  return (
    <CommonTable<ApprovalItem>
      data={data}
      isLoading={isLoading}
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
          cell: (row) => <StatusBadge status={row.status} size="sm" />,
        },
      ]}
      renderRowActions={(row) => (
        <Button size="sm" variant="default" onClick={() => onView(row.requestId, row.id)}>
          View
        </Button>
      )}
      rowToSearchString={(row) => [row.employeeName, row.folderName, row.accessType, row.status].join(' ')}
      onRefresh={refreshData}
      emptyMessage="No approval history"
      searchPlaceholder="Search history"
    />
  )
}
