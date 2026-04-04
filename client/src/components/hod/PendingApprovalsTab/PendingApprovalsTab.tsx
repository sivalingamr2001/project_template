import { Card, CardContent } from '../../ui/card';
import { PendingTable } from './PendingTable';
import { useHODApprove } from '../useHODApprove';
import { useHODPending } from '../useHODPending';
import { useHODReject } from '../useHODReject';

export function PendingApprovalsTab() {
  const { data = [], isLoading } = useHODPending();
  const approve = useHODApprove();
  const reject = useHODReject();

  return (
    <Card>
      <CardContent className="pt-4">
        <PendingTable
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
