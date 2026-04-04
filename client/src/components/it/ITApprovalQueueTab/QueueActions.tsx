import { ApproveRejectActions } from '@/components/hod/PendingApprovalsTab/ApproveRejectActions';

export function QueueActions(props: {
  requestId: number;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
  isPending: boolean;
}) {
  return <ApproveRejectActions {...props} />;
}
