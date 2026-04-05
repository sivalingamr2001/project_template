import type { ApprovalRecord } from '../../lib/types';
import { formatDateTime } from '../../lib/utils';
import { Check, X } from 'lucide-react';

interface ApprovalTimelineProps {
  timeline: ApprovalRecord[];
  compact?: boolean;
}

export function ApprovalTimeline({ timeline, compact = false }: ApprovalTimelineProps) {
  const isApprovedAction = (action: ApprovalRecord["action"]) =>
    action === 'HODApproved' || action === 'ITApproved' || action === 'AccessGranted'

  if (!timeline.length) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No approval activity yet
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      {timeline.map((record, idx) => (
        <div key={record.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`rounded-full p-2 ${
              isApprovedAction(record.action)
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {isApprovedAction(record.action) ? (
                <Check size={16} />
              ) : (
                <X size={16} />
              )}
            </div>
            {idx < timeline.length - 1 && (
              <div className="w-1 h-8 bg-border mt-2" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="font-medium text-sm">
              {record.approverName} ({record.approverRole === 'HOD' ? 'HOD' : 'IT'})
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDateTime(record.timestamp)}
            </div>
            {record.comment && (
              <div className="text-sm text-foreground mt-1 bg-secondary/50 p-2 rounded border border-border">
                {record.comment}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              {isApprovedAction(record.action) ? '✓ Approved' : '✗ Rejected'}
              {record.previousStatus && ` from ${record.previousStatus}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
