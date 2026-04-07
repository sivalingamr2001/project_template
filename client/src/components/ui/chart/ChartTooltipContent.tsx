import * as React from "react"
import type * as RechartsPrimitive from "recharts"
import type { TooltipValueType } from "recharts"
import { cn } from "@/lib/utils"
import { useChart } from "./ChartContext"
import type { TooltipNameType } from "./types"
import { useTooltipLabel } from "./TooltipLabel"
import { TooltipItemRow } from "./TooltipItemRow"

type Props = React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  } & Omit<
    RechartsPrimitive.DefaultTooltipContentProps<TooltipValueType, TooltipNameType>,
    "accessibilityLayer"
  >

export function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: Props) {
  const { config } = useChart()

  const tooltipLabel = useTooltipLabel({
    config,
    payload,
    labelKey,
    label,
    hideLabel,
    labelFormatter,
    labelClassName,
  })

  if (!active || !payload?.length) return null
  const nestLabel = payload.length === 1 && indicator !== "dot"

  const items = payload
    .map((item, index) => (
      <TooltipItemRow
        key={index}
        item={item}
        index={index}
        config={config}
        nameKey={nameKey}
        indicator={indicator}
        hideIndicator={hideIndicator}
        color={color}
        nestLabel={nestLabel}
        tooltipLabel={tooltipLabel}
        formatter={formatter}
      />
    ))
    .filter(Boolean)

  return (
    <div
      className={cn(
        "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">{items}</div>
    </div>
  )
}

