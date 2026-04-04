import type { ITQueueItem } from '../it.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { QueueActions } from './QueueActions';

export function QueueTable(props: {
  data: ITQueueItem[];
  isLoading: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
  isPending: boolean;
}) {
  if (props.isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading IT queue...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Folder</TableHead>
          <TableHead>Access</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No queue items</TableCell>
          </TableRow>
        ) : (
          props.data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.employeeName}</TableCell>
              <TableCell>{row.folderName}</TableCell>
              <TableCell>{row.accessType}</TableCell>
              <TableCell>
                <QueueActions
                  requestId={row.id}
                  onApprove={props.onApprove}
                  onReject={props.onReject}
                  isPending={props.isPending}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
