import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function HODStats({ stats }: { stats: { pendingCount: number; approvedMonth: number; rejectedMonth: number } }) {
  const items = [
    { label: 'Pending', value: stats.pendingCount },
    { label: 'Approved This Month', value: stats.approvedMonth },
    { label: 'Rejected This Month', value: stats.rejectedMonth },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
