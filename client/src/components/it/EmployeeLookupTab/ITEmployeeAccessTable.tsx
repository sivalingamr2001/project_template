import type { AccessListItem } from '../../hod/hod.types'
import { StatusBadge } from '../../shared/StatusBadge'
import { CommonTable } from '../../shared/CommonTable'
import { RevokeButton } from '../ActiveAccessTab/RevokeButton'
import { useData } from '../../../context/DataContext'

export function ITEmployeeAccessTable({
  data,
  onRevoke,
}: {
  data: AccessListItem[]
  onRevoke: (id: number) => void
}) {
  const { refreshData } = useData()

  return (
    <CommonTable<AccessListItem>
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
          header: 'Status',
          cell: (row) => <StatusBadge status={row.status} size="sm" />,
        },
      ]}
      renderRowActions={(row) => (
        <RevokeButton onConfirm={() => onRevoke(row.id)} />
      )}
      rowToSearchString={(row) => [row.folderName, row.accessType, row.status].join(' ')}
      onRefresh={refreshData}
      emptyMessage="No access records"
      searchPlaceholder="Search access records"
    />
  )
}
