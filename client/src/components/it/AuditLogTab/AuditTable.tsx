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
          header: 'User',
          cell: (row) => (
            <div>
              <div>{row.requester ?? '-'}</div>
              <div className="text-xs text-muted-foreground">{row.requesterEmail ?? '-'}</div>
            </div>
          ),
        },
        {
          header: 'Department / HOD',
          cell: (row) => (
            <div>
              <div>{row.department ?? '-'}</div>
              <div className="text-xs text-muted-foreground">HOD: {row.hod ?? '-'}</div>
            </div>
          ),
        },
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
        {
          header: 'Approved By',
          cell: (row) => row.approvedBy ?? '-',
        },
        {
          header: 'IT Approved By',
          cell: (row) => row.itApprovedBy ?? '-',
        },
      ]}
      rowToSearchString={(row) => [row.requester, row.requesterEmail, row.department, row.hod, row.action, row.actor, row.createdOn, row.approvedBy, row.itApprovedBy].join(' ')}
      onRefresh={refreshData}
      emptyMessage="No audit entries"
      searchPlaceholder="Search audit log"
    />
  )
}
