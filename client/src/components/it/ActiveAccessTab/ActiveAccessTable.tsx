import type { ActiveAccessItem } from '../it.types';
import { StatusBadge } from '../../shared/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { RevokeButton } from './RevokeButton';

export function ActiveAccessTable({ data, onRevoke }: { data: ActiveAccessItem[]; onRevoke: (id: number) => void }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Folder</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No active access records</TableCell>
          </TableRow>
        ) : (
          data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.employeeName}</TableCell>
              <TableCell>{row.folderName}</TableCell>
              <TableCell>{row.expiresAt ?? '-'}</TableCell>
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
