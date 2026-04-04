import type { ApprovalItem } from '../../hod/hod.types';
import { StatusBadge } from '../../shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { RevokeButton } from '../ActiveAccessTab/RevokeButton';

export function ITEmployeeAccessTable({
  data,
  onRevoke,
}: {
  data: ApprovalItem[];
  onRevoke: (id: number) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Folder</TableHead>
          <TableHead>Access</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">No access records</TableCell>
          </TableRow>
        ) : (
          data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.folderName}</TableCell>
              <TableCell>{row.accessType}</TableCell>
              <TableCell>
                <StatusBadge status={row.status === 'APPROVED' ? 'ACTIVE' : row.status === 'REJECTED' ? 'REJECTED' : 'PENDING'} size="sm" />
              </TableCell>
              <TableCell>
                <RevokeButton onConfirm={() => onRevoke(row.id)} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
