import { Card, CardContent } from '../../ui/card';
import { QueueTable } from './QueueTable';
import { useITQueue } from '../useITQueue';
import { useApp } from '@/hooks/useApp';

export function ITApprovalQueueTab() {
  const { data = [], isLoading, reload } = useITQueue();
  const { setSelectedRequestId, setCurrentPage } = useApp();

  return (
    <Card>
      <CardContent className="pt-4">
        <QueueTable
          data={data}
          isLoading={isLoading}
          onReload={reload}
          onView={(requestId) => {
            setSelectedRequestId(requestId);
            setCurrentPage('EMPLOYEE_REQUEST_DETAIL');
          }}
        />
      </CardContent>
    </Card>
  );
}
