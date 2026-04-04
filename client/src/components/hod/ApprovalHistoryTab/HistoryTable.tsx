import type { ApprovalItem } from '../hod.types';
import { StatusBadge } from '../../shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';

export function HistoryTable({ data, isLoading }: { data: ApprovalItem[]; isLoading: boolean }) {
  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading history...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Folder</TableHead>
          <TableHead>Access</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No approval history</TableCell>
          </TableRow>
        ) : (
          data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.employeeName}</TableCell>
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
