import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../shared/StatusBadge';
import { AuditLog } from '../shared/AuditLog';
import { ApprovalTimeline } from '../shared/ApprovalTimeline';
import { formatDate, getDaysUntilExpiry } from '../../lib/utils';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export function RequestDetails() {
  const { requests } = useData();
  const { selectedRequestId, setCurrentPage } = useApp();

  const request = requests.find(r => r.id === selectedRequestId);

  if (!request) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Request not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => setCurrentPage('EMPLOYEE_REQUESTS')}
        className="flex items-center gap-2 text-primary hover:underline"
      >
        <ArrowLeft size={18} />
        Back to Requests
      </button>

      <div className="bg-background border border-border rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Request Details</h1>
            <p className="text-muted-foreground">Requested on {formatDate(request.requestedAt)}</p>
          </div>
          <StatusBadge status={request.status} size="lg" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground">Department</p>
            <p className="font-semibold">{request.requesterDept}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Items Requested</p>
            <p className="font-semibold">{request.items.length}</p>
          </div>
        </div>

        <h2 className="font-bold mb-4">Access Items</h2>
        <div className="space-y-3 mb-6">
          {request.items.map(item => (
            <div key={item.id} className="border border-border rounded p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{item.system}</p>
                  <p className="text-sm text-muted-foreground">{item.accessType}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Expires</p>
                  <p className="font-medium">{formatDate(item.expiresAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Days Left</p>
                  <p className="font-medium">{getDaysUntilExpiry(item)}</p>
                </div>
              </div>
              {getDaysUntilExpiry(item) < 30 && getDaysUntilExpiry(item) > 0 && (
                <div className="mt-3 flex items-center gap-2 text-yellow-700 bg-yellow-50 p-2 rounded text-xs">
                  <AlertCircle size={14} />
                  Expiring soon
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="font-bold mb-4">Approval Timeline</h2>
            <ApprovalTimeline timeline={request.approvalTimeline} compact />
          </div>
          <div>
            <AuditLog request={request} />
          </div>
        </div>

        {request.rejectionReason && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded text-destructive">
            <p className="font-medium text-sm mb-1">Rejection Reason</p>
            <p className="text-sm">{request.rejectionReason}</p>
          </div>
        )}
      </div>
    </div>
  );
}
