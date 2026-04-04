import type { AccessListItem } from '../hod.types'
import { StatusBadge } from '../../shared/StatusBadge'
import { CommonTable } from '../../shared/CommonTable'
import { useData } from '../../../context/DataContext'

export function HistoryTable({ data, isLoading }: { data: AccessListItem[]; isLoading: boolean }) {
  const { refreshData } = useData()

  return (
    <CommonTable<AccessListItem>
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
          cell: (row) => (
            <StatusBadge
              status={row.status === 'APPROVED' ? 'ACTIVE' : row.status === 'REJECTED' ? 'REJECTED' : 'PENDING'}
              size="sm"
            />
          ),
        },
      ]}
      rowToSearchString={(row) => [row.employeeName, row.folderName, row.accessType, row.status].join(' ')}
      onRefresh={refreshData}
      emptyMessage="No approval history"
      searchPlaceholder="Search history"
    />
  )
}
