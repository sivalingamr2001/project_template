import type { AccessListItem } from '../../hod/hod.types'
import { StatusBadge } from '../../shared/StatusBadge'
import { CommonTable } from '../../shared/CommonTable'
import { RevokeButton } from '../ActiveAccessTab/RevokeButton'
import { useData } from '../../../context/DataContext'

type EmployeeAccessItem = AccessListItem & { requestId: number }

export function ITEmployeeAccessTable({
  data,
  onRevoke,
}: {
  data: EmployeeAccessItem[]
  onRevoke: (requestId: number, itemId: number) => void
}) {
  const { refreshData } = useData()

  return (
    <CommonTable<EmployeeAccessItem>
      data={data}
      isLoading={false}
      rowKey={(row) => row.id}
      columns={[
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
        {
          header: 'IT Approved By',
          cell: (row) => row.itApprovedBy ?? '-',
        },
        {
          header: 'Status',
          cell: (row) => <StatusBadge status={row.status} size="sm" />,
        },
      ]}
      renderRowActions={(row) => (
        <RevokeButton onConfirm={() => onRevoke(row.requestId, row.id)} />
      )}
      rowToSearchString={(row) => [row.folderName, row.accessType, row.status].join(' ')}
      onRefresh={refreshData}
      emptyMessage="No access records"
      searchPlaceholder="Search access records"
    />
  )
}
