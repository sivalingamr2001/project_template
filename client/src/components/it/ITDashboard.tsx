import { ActiveAccessTab } from './ActiveAccessTab';
import { AuditLogTab } from './AuditLogTab';
import { ITEmployeeLookupTab } from './EmployeeLookupTab';
import { ITApprovalQueueTab } from './ITApprovalQueueTab';
import { ITStats } from './ITStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const mockStats = { queue: 1, active: 16, expiringSoon: 4 };

export function ITDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">IT Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Legacy IT workspace rebuilt with local UI primitives.</p>
      </div>

      <ITStats stats={mockStats} />

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Approval Queue</TabsTrigger>
          <TabsTrigger value="active">Active Access</TabsTrigger>
          <TabsTrigger value="lookup">Employee Lookup</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>
        <TabsContent value="queue">
          <ITApprovalQueueTab />
        </TabsContent>
        <TabsContent value="active">
          <ActiveAccessTab />
        </TabsContent>
        <TabsContent value="lookup">
          <ITEmployeeLookupTab />
        </TabsContent>
        <TabsContent value="audit">
          <AuditLogTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
