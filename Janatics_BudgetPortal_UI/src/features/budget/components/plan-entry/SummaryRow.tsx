import {
  formatINR,
  formatPercent,
  varianceClassName,
} from "./utils/budgetTableUtils"

interface SummaryRowProps {
  actual: number
  label: string
  planned: number
  subtle?: boolean
  variance: number
  variancePercent: number
  className?: string
}

export function SummaryRow({
  actual,
  label,
  planned,
  subtle = false,
  variance,
  variancePercent,
  className,
}: SummaryRowProps) {
  return (
    <tr
      className={`${
        subtle
          ? "border-blue-500/50 bg-blue-500/10 text-blue-600 backdrop-blur-xl dark:text-blue-400"
          : "border-emerald-500/50 bg-emerald-500/20 text-emerald-600 backdrop-blur-lg dark:text-emerald-400"
      } ${className ?? ""}`.trim()}
    >
      <td className="px-4 py-3 font-medium text-foreground">{label}</td>
      <td className="px-4 py-3 text-right text-foreground">
        {formatINR(planned)}
      </td>
      <td className="px-4 py-3 text-right text-foreground">
        {formatINR(actual)}
      </td>
      <td
        className={`px-4 py-3 text-right font-medium ${varianceClassName(variance)}`}
      >
        {formatINR(variance)}
      </td>
      <td
        className={`px-4 py-3 text-right font-medium ${varianceClassName(variance)}`}
      >
        {formatPercent(variancePercent)}
      </td>
    </tr>
  )
}
