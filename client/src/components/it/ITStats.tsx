import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function ITStats({ stats }: { stats: { queue: number; active: number; expiringSoon: number } }) {
  const items = [
    { label: 'Queue', value: stats.queue },
    { label: 'Active Access', value: stats.active },
    { label: 'Expiring Soon', value: stats.expiringSoon },
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
