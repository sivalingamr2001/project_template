"use client"

import * as RechartsPrimitive from "recharts"

export type { ChartConfig, TooltipNameType } from "./types"

export { ChartContainer } from "./ChartContainer"
export { ChartStyle } from "./ChartStyle"

export const ChartTooltip = RechartsPrimitive.Tooltip
export { ChartTooltipContent } from "./ChartTooltipContent"

export const ChartLegend = RechartsPrimitive.Legend
export { ChartLegendContent } from "./ChartLegendContent"

