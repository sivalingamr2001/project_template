import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface RequestDashboardStats {
  totalRequests: number;
  approved: number;
  pending: number;
}

export function RequesterStats({ stats }: { stats: RequestDashboardStats }) {
  const items = [
    { title: 'Total Requests', value: stats.totalRequests },
    { title: 'Approved', value: stats.approved },
    { title: 'Pending', value: stats.pending },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}