import type * as React from "react"
import { cn } from "@/lib/utils"
import { getPayloadConfigFromPayload } from "./getPayloadConfigFromPayload"
import type { ChartConfig } from "./types"
interface Props {
  item: any
  index: number
  config: ChartConfig
  nameKey?: string
  indicator: "line" | "dot" | "dashed"
  hideIndicator: boolean
  color?: string
  nestLabel: boolean
  tooltipLabel: React.ReactNode
  formatter?: any
}

export function TooltipItemRow({
  item,
  index,
  config,
  nameKey,
  indicator,
  hideIndicator,
  color,
  nestLabel,
  tooltipLabel,
  formatter,
}: Props) {
  if (item.type === "none") return null
  const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`
  const itemConfig = getPayloadConfigFromPayload(config, item, key)
  const indicatorColor = color ?? item.payload?.fill ?? item.color

  if (formatter && item?.value !== undefined && item.name) {
    return (
      <div
        key={index}
        className={cn(
          "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
          indicator === "dot" && "items-center"
        )}
      >
        {formatter(item.value, item.name, item, index, item.payload)}
      </div>
    )
  }

  const indicatorNode = itemConfig?.icon ? (
    <itemConfig.icon />
  ) : (
    !hideIndicator && (
      <div
        className={cn("shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)", {
          "h-2.5 w-2.5": indicator === "dot",
          "w-1": indicator === "line",
          "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
          "my-0.5": nestLabel && indicator === "dashed",
        })}
        style={
          {
            "--color-bg": indicatorColor,
            "--color-border": indicatorColor,
          } as React.CSSProperties
        }
      />
    )
  )

  return (
    <div
      key={index}
      className={cn(
        "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
        indicator === "dot" && "items-center"
      )}
    >
      {indicatorNode}
      <div
        className={cn(
          "flex flex-1 justify-between leading-none",
          nestLabel ? "items-end" : "items-center"
        )}
      >
        <div className="grid gap-1.5">
          {nestLabel ? tooltipLabel : null}
          <span className="text-muted-foreground">{itemConfig?.label ?? item.name}</span>
        </div>
        {item.value != null && (
          <span className="font-mono font-medium text-foreground tabular-nums">
            {typeof item.value === "number" ? item.value.toLocaleString() : String(item.value)}
          </span>
        )}
      </div>
    </div>
  )
}

