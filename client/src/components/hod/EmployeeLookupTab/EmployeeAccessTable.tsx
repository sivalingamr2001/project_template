import type { ApprovalItem } from '../hod.types';
import { StatusBadge } from '../../shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';

export function EmployeeAccessTable({ data }: { data: ApprovalItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Folder</TableHead>
          <TableHead>Access</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">No access records</TableCell>
          </TableRow>
        ) : (
          data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.folderName}</TableCell>
              <TableCell>{row.accessType}</TableCell>
              <TableCell>
                <StatusBadge status={row.status === 'APPROVED' ? 'ACTIVE' : row.status === 'REJECTED' ? 'REJECTED' : 'PENDING'} size="sm" />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
