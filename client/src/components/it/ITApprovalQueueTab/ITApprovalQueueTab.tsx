import { Card, CardContent } from '../../ui/card';
import { QueueTable } from './QueueTable';
import { useITQueue } from '../useITQueue';
import { useApp } from '@/hooks/useApp';

export function ITApprovalQueueTab() {
  const { data = [], isLoading } = useITQueue();
  const { setSelectedRequestId, setSelectedAccessItemId, setCurrentPage } = useApp();

  return (
    <Card>
      <CardContent className="pt-4">
        <QueueTable
          data={data}
          isLoading={isLoading}
          onView={(requestId, accessItemId) => {
            setSelectedRequestId(requestId);
            setSelectedAccessItemId(accessItemId);
            setCurrentPage('EMPLOYEE_REQUEST_DETAIL');
          }}
        />
      </CardContent>
    </Card>
  );
}
