import type * as React from "react"
import type * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"
import { useChart } from "./ChartContext"
import { getPayloadConfigFromPayload } from "./getPayloadConfigFromPayload"

type Props = React.ComponentProps<"div"> & {
  hideIcon?: boolean
  nameKey?: string
} & RechartsPrimitive.DefaultLegendContentProps

export function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: Props) {
  const { config } = useChart()
  if (!payload?.length) return null

  const renderItem = (item: any, index: number) => {
    if (item.type === "none") return null
    const key = `${nameKey ?? item.dataKey ?? "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    return (
      <div
        key={index}
        className={cn("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground")}
      >
        {itemConfig?.icon && !hideIcon ? (
          <itemConfig.icon />
        ) : (
          <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
        )}
        {itemConfig?.label}
      </div>
    )
  }

  const items = payload.map(renderItem).filter(Boolean)

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {items}
    </div>
  )
}

