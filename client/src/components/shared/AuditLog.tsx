import { useState } from 'react';
import type { AccessRequest } from '../../lib/types';
import { formatDateTime } from '../../lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AuditLogProps {
  request: AccessRequest;
}

export function AuditLog({ request }: AuditLogProps) {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Audit Log</h3>
      
      {/* Request level timeline */}
      <div className="bg-secondary/50 p-3 rounded border border-border">
        <div className="text-xs font-medium text-muted-foreground mb-2">Request Created</div>
        <div className="text-sm">{formatDateTime(request.requestedAt)}</div>
      </div>

      {/* Item-level approvals */}
      {request.items.map(item => (
        <div key={item.id} className="border border-border rounded">
          <button
            onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
            className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition"
          >
            <div className="text-left">
              <div className="font-medium text-sm">{item.system}</div>
              <div className="text-xs text-muted-foreground">{item.accessType}</div>
            </div>
            {expandedItemId === item.id ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          {expandedItemId === item.id && item.approvalHistory.length > 0 && (
            <div className="bg-secondary/30 p-3 border-t border-border space-y-2">
              {item.approvalHistory.map(record => (
                <div key={record.id} className="text-xs">
                  <div className="font-medium">
                    {record.approverName} ({record.approverRole === 'HOD' ? 'HOD' : 'IT'})
                  </div>
                  <div className="text-muted-foreground">
                    {record.action === 'APPROVED' ? '✓ Approved' : '✗ Rejected'}
                  </div>
                  <div className="text-muted-foreground">{formatDateTime(record.timestamp)}</div>
                  {record.previousStatus && (
                    <div className="text-muted-foreground">
                      Status: {record.previousStatus} → {record.action === 'APPROVED' ? 'APPROVED' : 'REJECTED'}
                    </div>
                  )}
                  {record.comment && (
                    <div className="bg-white dark:bg-slate-900 p-2 rounded mt-1 border border-border">
                      "{record.comment}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
