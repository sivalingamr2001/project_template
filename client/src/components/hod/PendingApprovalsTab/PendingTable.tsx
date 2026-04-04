import type { ApprovalItem } from '../hod.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { ApproveRejectActions } from './ApproveRejectActions';

export function PendingTable(props: {
  data: ApprovalItem[];
  isLoading: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
  isPending: boolean;
}) {
  if (props.isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading pending approvals...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Folder</TableHead>
          <TableHead>Access</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No pending requests</TableCell>
          </TableRow>
        ) : (
          props.data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.employeeName}</TableCell>
              <TableCell>{row.folderName}</TableCell>
              <TableCell>{row.accessType}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>
                <ApproveRejectActions
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
