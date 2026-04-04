import { Card, CardContent } from '../../ui/card';
import { QueueTable } from './QueueTable';
import { useITApprove } from '../useITApprove';
import { useITQueue } from '../useITQueue';
import { useITReject } from '../useITReject';

export function ITApprovalQueueTab() {
  const { data = [], isLoading } = useITQueue();
  const approve = useITApprove();
  const reject = useITReject();
  return (
    <Card>
      <CardContent className="pt-4">
        <QueueTable
          data={data}
          isLoading={isLoading}
          onApprove={(id) => approve.mutate(id)}
          onReject={(requestId, reason) => reject.mutate({ requestId, reason })}
          isPending={approve.isPending || reject.isPending}
        />
      </CardContent>
    </Card>
  );
}
