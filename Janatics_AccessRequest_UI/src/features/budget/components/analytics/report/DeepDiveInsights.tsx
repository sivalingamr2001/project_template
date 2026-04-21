import { formatINR } from "@/shared/utils/utils"

interface DeepDiveInsightsProps {
  categories: {
    category: string
    planned: number
    actual: number
    variance: number
    utilization: number
  }[]
}

export function DeepDiveInsights({ categories }: DeepDiveInsightsProps) {
  const highestVariance = categories.reduce(
    (prev, next) =>
      Math.abs(next.variance) > Math.abs(prev.variance) ? next : prev,
    categories[0] ?? {
      category: "N/A",
      planned: 0,
      actual: 0,
      variance: 0,
      utilization: 0,
    }
  )

  return (
    <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
      <div className="font-display text-xl text-foreground">
        Deep-Dive Insights
      </div>
      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
        <p>
          The root cause of the current variance is concentrated in{" "}
          <strong>{highestVariance.category}</strong>, where actual spend is{" "}
          <strong>{formatINR(highestVariance.actual)}</strong> versus a plan of{" "}
          <strong>{formatINR(highestVariance.planned)}</strong>.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Validate scope and resourcing assumptions for the top variance
            category to prevent further drift.
          </li>
          <li>
            Shift flexibility from lower-utilization categories to support
            priority initiatives without increasing total spend.
          </li>
          <li>
            Establish weekly budget checkpoints for categories above 100%
            utilization to catch overspend early.
          </li>
        </ul>
      </div>
    </div>
  )
}
