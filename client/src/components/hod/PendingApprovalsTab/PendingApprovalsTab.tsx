import { Card, CardContent } from '../../ui/card';
import { PendingTable } from './PendingTable';
import { useHODPending } from '../useHODPending';
import { useApp } from '@/hooks/useApp';

export function PendingApprovalsTab() {
  const { data = [], isLoading } = useHODPending();
  const { setSelectedRequestId, setSelectedAccessItemId, setCurrentPage } = useApp();

  return (
    <Card>
      <CardContent className="pt-4">
        <PendingTable
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
