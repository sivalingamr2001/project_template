import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import type { AccessRequest } from '../../lib/types';

const statusSteps = [
  { key: 'PENDING', label: 'Submitted', color: 'bg-yellow-500' },
  { key: 'HOD_APPROVED', label: 'HOD Review', color: 'bg-blue-500' },
  { key: 'APPROVED_IT', label: 'IT Review', color: 'bg-orange-500' },
  { key: 'ACTIVE', label: 'Access Granted', color: 'bg-green-500' },
  { key: 'EXPIRED', label: 'Expired/Revoked', color: 'bg-red-500' },
];

export function RequestTimeline({ request }: { request?: AccessRequest }) {
  if (!request) return null;

  const normalizedStatus =
    request.status === 'REVOKED' || request.status === 'REJECTED' ? 'EXPIRED' : request.status;
  let currentStepIndex = statusSteps.findIndex(step => step.key === normalizedStatus);
  if (currentStepIndex < 0) currentStepIndex = 0;

  return (
    <div className="space-y-6">
      {/* Status Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Request Status</h3>
        <div className="flex items-center space-x-4">
          {statusSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const dotClass = isCompleted ? 'text-green-400' : isCurrent ? 'text-blue-400' : 'text-gray-300';

            const StepIcon = isCurrent ? Loader2 : isCompleted ? CheckCircle2 : Circle;

            return (
              <div key={step.key} className="flex items-center">
                <StepIcon className={`h-4 w-4 ${dotClass} animate-pulse`} />
                <span className={`ml-2 text-sm ${isCompleted || isCurrent ? 'font-semibold' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
                {index < statusSteps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-primary' : 'bg-gray-300'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Request Details */}
      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Systems</Label>
              <p className="text-sm text-muted-foreground">
                {request.items.map(i => i.system).join(', ')}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Access Types</Label>
              <p className="text-sm text-muted-foreground">
                {request.items.map(i => i.accessType).join(', ')}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Requested Date</Label>
              <p className="text-sm text-muted-foreground">
                {formatDate(request.requestedAt)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge variant="outline">{request.status}</Badge>
            </div>
          </div>
          {request.rejectionReason && (
            <div>
              <Label className="text-sm font-medium">Rejection Reason</Label>
              <p className="text-sm text-muted-foreground">{request.rejectionReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Timeline */}
      {request.approvalTimeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Approval History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {request.approvalTimeline.map((record, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {record.action} by {record.approverName} ({record.approverRole})
                    </p>
                    {record.comment && (
                      <p className="text-sm text-muted-foreground">{record.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(record.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}