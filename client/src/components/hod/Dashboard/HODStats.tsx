import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { HODStatsData } from "../../types"

const STAT_ITEMS = [
  { key: "pendingCount", label: "Pending" },
  { key: "approvedMonth", label: "Approved This Month" },
  { key: "rejectedMonth", label: "Rejected This Month" },
] as const

export function HODStats({ stats }: { stats: HODStatsData }) {
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
