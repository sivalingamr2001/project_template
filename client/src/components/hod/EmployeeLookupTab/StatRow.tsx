import { Card, CardContent } from '../../ui/card';

export function StatRow({ active, pending, expired }: { active: number; pending: number; expired: number }) {
  const items = [
    { label: 'Active', value: active },
    { label: 'Pending', value: pending },
    { label: 'Expired', value: expired },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">{item.label}</div>
            <div className="text-2xl font-semibold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
