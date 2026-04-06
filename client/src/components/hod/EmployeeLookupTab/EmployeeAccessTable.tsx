import type { AccessListItem } from '../hod.types';
import { StatusBadge } from '../../shared/StatusBadge';
import { CommonTable } from '../../shared/CommonTable';
import { useData } from '../../../context/DataContext';

export function EmployeeAccessTable({ data }: { data: AccessListItem[] }) {
  const { refreshData } = useData();

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
      rowToSearchString={(row) => [row.folderName, row.accessType, row.status].join(' ')}
      onRefresh={refreshData}
      emptyMessage="No access records"
      searchPlaceholder="Search access records"
    />
  );
}
