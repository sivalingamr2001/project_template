import { ApproveRejectActions } from '@/components/hod/PendingApprovalsTab/ApproveRejectActions';

export function QueueActions(props: {
  requestId: number;
  itemId?: number;
  employeeName: string;
  empId: number;
  folderName: string;
  accessType: string;
  status: string;
  mode: 'HOD' | 'IT';
  onApprove: (id: number, itemId: number, options: { accessType?: string; comment?: string; durationDays?: number }) => void;
  onReject: (id: number, itemId: number, reason: string) => void;
  isPending: boolean;
}) {
  return <ApproveRejectActions {...props} />;
}
