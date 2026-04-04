import type { AuditLogItem } from '../it.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { AuditActionTag } from './AuditActionTag';

export function AuditTable({ data, isLoading }: { data: AuditLogItem[]; isLoading: boolean }) {
  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading audit log...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Action</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead>Created On</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No audit entries</TableCell>
          </TableRow>
        ) : (
          data.map((row) => (
            <TableRow key={row.id}>
              <TableCell><AuditActionTag action={row.action} /></TableCell>
              <TableCell>{row.actor}</TableCell>
              <TableCell>{row.createdOn}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
