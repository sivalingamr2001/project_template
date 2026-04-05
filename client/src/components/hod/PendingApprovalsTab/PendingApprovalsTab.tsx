import { Card, CardContent } from '../../ui/card';
import { PendingTable } from './PendingTable';
import { useHODPending } from '../useHODPending';
import { useApp } from '@/hooks/useApp';

export function PendingApprovalsTab() {
  const { data = [], isLoading, reload } = useHODPending();
  const { setSelectedRequestId, setCurrentPage } = useApp();

  return (
    <Card>
      <CardContent className="pt-4">
        <PendingTable
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
