import * as React from "react"
import { cn } from "@/lib/utils"
import { getPayloadConfigFromPayload } from "./getPayloadConfigFromPayload"
import type { ChartConfig } from "./types"

interface Props {
  config: ChartConfig
  payload: any[] | undefined
  labelKey?: string
  label?: unknown
  hideLabel: boolean
  labelFormatter?: ((value: React.ReactNode, payload: any[]) => React.ReactNode) | undefined
  labelClassName?: string
}

export function useTooltipLabel({
  config,
  payload,
  labelKey,
  label,
  hideLabel,
  labelFormatter,
  labelClassName,
}: Props) {
  return React.useMemo(() => {
    if (hideLabel || !payload?.length) return null
    const [item] = payload
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string"
        ? (config[label]?.label ?? label)
        : itemConfig?.label
    if (!value) return null
    const content = labelFormatter ? labelFormatter(value, payload) : value
    return <div className={cn("font-medium", labelClassName)}>{content}</div>
  }, [config, hideLabel, label, labelClassName, labelFormatter, labelKey, payload])
}

