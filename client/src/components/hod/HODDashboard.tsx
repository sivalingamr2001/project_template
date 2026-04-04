import { HODStats } from './HODStats';
import { ApprovalHistoryTab } from './ApprovalHistoryTab';
import { EmployeeLookupTab } from './EmployeeLookupTab';
import { PendingApprovalsTab } from './PendingApprovalsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const mockStats = { pendingCount: 3, approvedMonth: 12, rejectedMonth: 2 };

export function HODDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">HOD Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Legacy HOD workspace rebuilt with local UI primitives.</p>
      </div>

      <HODStats stats={mockStats} />

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="history">Approval History</TabsTrigger>
          <TabsTrigger value="lookup">Employee Lookup</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <PendingApprovalsTab />
        </TabsContent>
        <TabsContent value="history">
          <ApprovalHistoryTab />
        </TabsContent>
        <TabsContent value="lookup">
          <EmployeeLookupTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
