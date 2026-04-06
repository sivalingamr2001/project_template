import { Clock, CheckCircle, AlertCircle, Trash2 } from "lucide-react"
import type { DashboardStats } from "./hooks/useDashboardStats"

const STAT_ITEMS = [
  {
    key: "pendingApprovals" as keyof DashboardStats,
    label: "Pending Approvals",
    icon: Clock,
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  {
    key: "approvedToday" as keyof DashboardStats,
    label: "Approved Today",
    icon: CheckCircle,
    iconColor: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    key: "expiringWithin30Days" as keyof DashboardStats,
    label: "Expiring Within 30 Days",
    icon: AlertCircle,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    key: "revokedAccess" as keyof DashboardStats,
    label: "Revoked Access",
    icon: Trash2,
    iconColor: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
] as const

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {STAT_ITEMS.map((item) => (
        <StatCard
          key={item.key}
          label={item.label}
          value={stats[item.key]}
          icon={item.icon}
          iconColor={item.iconColor}
          bgColor={item.bgColor}
          borderColor={item.borderColor}
        />
      ))}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  bgColor,
  borderColor,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string; size?: number }>
  iconColor: string
  bgColor: string
  borderColor: string
}) {
  return (
    <div className={`${bgColor} ${borderColor} rounded-lg border p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        <Icon className={iconColor} size={24} />
      </div>
    </div>
  )
}
