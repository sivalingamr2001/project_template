import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RequestDashboardStats {
  totalRequests: number
  approved: number
  pending: number
}

interface StatItem {
  title: string
  value: number
}

const STAT_ITEMS: (stats: RequestDashboardStats) => StatItem[] = (stats) => [
  { title: "Total Requests", value: stats.totalRequests },
  { title: "Approved", value: stats.approved },
  { title: "Pending", value: stats.pending },
]

export function RequesterStats({ stats }: { stats: RequestDashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {STAT_ITEMS(stats).map((item) => (
        <StatCard key={item.title} title={item.title} value={item.value} />
      ))}
    </div>
  )
}

function StatCard({ title, value }: StatItem) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
