import { useData } from '../context/DataContext';
import { RoleGuard } from '../components/shared/RoleGuard';
import { StatsCards } from '../components/dashboard/StatsCards';
import { TrendChart } from '../components/dashboard/TrendChart';
import { AuditLog } from '../components/shared/AuditLog';

export function Analytics() {
  const { requests } = useData();

  return (
    <RoleGuard allowed={['HOD', 'IT_INFRA']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Executive overview of access management metrics</p>
        </div>

        <StatsCards />

        <TrendChart />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requests.slice(0, 2).map(request => (
            <div key={request.id} className="bg-background border border-border rounded-lg p-6">
              <h3 className="font-bold mb-4">Request: {request.requesterName}</h3>
              <AuditLog request={request} />
            </div>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
