import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { MyRequestsTable } from '../components/employee/MyRequestsTable';
import { NewRequestModal } from '../components/employee/NewRequestModal';
import { RequestDetailDrawer } from '../components/employee/RequestDetailDrawer';
import { RequesterStats } from '../components/employee/RequesterStats';

export function EmployeeDashboard() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { requests } = useData();
  const { currentUser } = useApp();

  const userRequests = requests.filter(r => r.requesterId === currentUser?.id);
  const stats = {
    totalRequests: userRequests.length,
    approved: userRequests.filter(r => r.status === 'ACTIVE').length,
    pending: userRequests.filter(r => ['PENDING', 'HOD_APPROVED'].includes(r.status)).length,
  };

  const selected = userRequests.find(r => r.id === selectedId);

  const handleCreateRequest = (data: any) => {
    console.log('Create request:', data);
    setCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Employee Dashboard</h1>
        <div className="space-y-1 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
          <p className="text-lg font-semibold text-foreground">
            Welcome, {currentUser?.name || 'Guest'}
          </p>
          <p className="text-sm text-muted-foreground">{currentUser?.email || ''}</p>
        </div>
      </div>

      <RequesterStats stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <MyRequestsTable
            data={userRequests}
            isLoading={false}
            onViewDetail={setSelectedId}
            onNewRequest={() => setCreateOpen(true)}
          />
        </CardContent>
      </Card>

      <NewRequestModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateRequest}
        isPending={false}
      />

      <RequestDetailDrawer
        open={selectedId !== null}
        request={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
