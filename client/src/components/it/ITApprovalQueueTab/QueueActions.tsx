import { ApproveRejectActions } from '@/components/hod/PendingApprovalsTab/ApproveRejectActions';

export function QueueActions(props: {
  requestId: number;
  detailId: number;
  approvalId: number;
  employeeName: string;
  empId: number;
  folderName: string;
  accessType: string;
  status: string;
  mode: 'HOD' | 'IT';
  onApprove: (args: { requestId: number; detailId: number; approvalId: number; accessType: string; comment?: string }) => void;
  onReject: (args: { requestId: number; detailId: number; approvalId: number; reason: string }) => void;
  isPending: boolean;
}) {
  return <ApproveRejectActions {...props} />;
}
