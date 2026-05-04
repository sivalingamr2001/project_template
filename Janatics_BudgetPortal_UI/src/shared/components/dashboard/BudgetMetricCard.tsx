import { Badge } from "@/shared/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

interface BudgetMetricCardProps {
  title: string
  value: string
  subtitle: string
  change: string
  trend: "positive" | "negative" | "neutral"
  footer?: React.ReactNode
}

export function BudgetMetricCard({
  title,
  value,
  subtitle,
  change,
  trend,
  footer,
}: BudgetMetricCardProps) {
  return (
    <Card className="border border-border bg-background">
      <CardHeader className="gap-2 px-4 pt-4 pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          {trend === "positive" ? (
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          ) : trend === "negative" ? (
            <ArrowDownRight className="h-4 w-4 text-rose-600" />
          ) : null}
          <span>{change}</span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-1 pb-4">
        <div className="text-3xl font-semibold">{value}</div>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{subtitle}</span>
          <Badge
            variant={
              trend === "positive"
                ? "secondary"
                : trend === "negative"
                  ? "destructive"
                  : "outline"
            }
          >
            {trend === "positive"
              ? "Under budget"
              : trend === "negative"
                ? "Over budget"
                : "Neutral"}
          </Badge>
        </div>
      </CardContent>
      {footer && (
        <span className="text-[10px] italic opacity-70">{footer}</span>
      )}
    </Card>
  )
}
