import { ApproveRejectActions } from '@/components/hod/PendingApprovalsTab/ApproveRejectActions';

export function QueueActions(props: {
  requestId: number;
  employeeName: string;
  empId: number;
  folderName: string;
  accessType: string;
  status: string;
  mode: 'HOD' | 'IT';
  onApprove: (id: number, options: { accessType: string; comment?: string }) => void;
  onReject: (id: number, reason: string) => void;
  isPending: boolean;
}) {
  return <ApproveRejectActions {...props} />;
}
