import type { AuditLogItem } from '../it.types'
import { CommonTable } from '../../shared/CommonTable'
import { AuditActionTag } from './AuditActionTag'
import { useData } from '../../../context/DataContext'

export function AuditTable({ data, isLoading }: { data: AuditLogItem[]; isLoading: boolean }) {
  const { refreshData } = useData()

  return (
    <CommonTable<AuditLogItem>
      data={data}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      columns={[
        {
          header: 'Action',
          cell: (row) => <AuditActionTag action={row.action} />,
        },
        {
          header: 'Actor',
          cell: (row) => row.actor,
        },
        {
          header: 'Created On',
          cell: (row) => row.createdOn,
        },
      ]}
      rowToSearchString={(row) => [row.action, row.actor, row.createdOn].join(' ')}
      onRefresh={refreshData}
      emptyMessage="No audit entries"
      searchPlaceholder="Search audit log"
    />
  )
}
