import { Card, CardContent } from '../../ui/card';
import { useHODAllRequests } from '../useHODAllRequests';
import { useApp } from '@/context/AppContext';
import { useData } from '../../../context/DataContext';
import { Button } from '../../ui/button';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { HODAllRequestsTable } from './HODAllRequestsTable';

export function HODAllRequestsTab() {
  const { data = [], isLoading } = useHODAllRequests();
  const { setSelectedRequestId, setSelectedAccessItemId, setCurrentPage } = useApp();
  const { refreshData } = useData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">All Requests</h2>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <HODAllRequestsTable
          data={data}
          isLoading={isLoading}
          onView={(requestId, itemId) => {
            setSelectedRequestId(requestId);
            setSelectedAccessItemId(itemId);
            setCurrentPage('EMPLOYEE_REQUEST_DETAIL');
          }}
        />
      </CardContent>
    </Card>
  );
}