import type { ActiveAccessItem } from '../it.types'
import { StatusBadge } from '../../shared/StatusBadge'
import { CommonTable } from '../../shared/CommonTable'
import { RevokeButton } from './RevokeButton'
import { useData } from '../../../context/DataContext'

export function ActiveAccessTable({ data, onRevoke }: { data: ActiveAccessItem[]; onRevoke: (id: number) => void }) {
  const { refreshData } = useData()

  return (
    <CommonTable<ActiveAccessItem>
      data={data}
      isLoading={false}
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
          header: 'Expires',
          cell: (row) => row.expiresAt ?? '-',
        },
        {
          header: 'Status',
          cell: (row) => <StatusBadge status={row.status} size="sm" />,
        },
      ]}
      renderRowActions={(row) => (
        <RevokeButton onConfirm={() => onRevoke(row.id)} />
      )}
      rowToSearchString={(row) => [row.employeeName, row.folderName, row.expiresAt ?? '', row.status].join(' ')}
      onRefresh={refreshData}
      emptyMessage="No active access records"
      searchPlaceholder="Search active access"
    />
  )
}
