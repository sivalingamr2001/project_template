import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ITStatsData } from "../../types"

const STAT_ITEMS = [
  { key: "queue", label: "Queue" },
  { key: "active", label: "Active Access" },
  { key: "expiringSoon", label: "Expiring Soon" },
] as const

export function ITStats({ stats }: { stats: ITStatsData }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {STAT_ITEMS.map((item) => (
        <StatCard
          key={item.key}
          label={item.label}
          value={stats[item.key]}
        />
      ))}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
