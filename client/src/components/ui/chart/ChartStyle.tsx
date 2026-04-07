import type { ChartConfig } from "./types"
import { THEMES } from "./constants"

interface Props {
  id: string
  config: ChartConfig
}

export function ChartStyle({ id, config }: Props) {
  const colorConfig = Object.entries(config).filter(([, c]) => c.theme ?? c.color)
  if (!colorConfig.length) return null

  const css = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const vars = colorConfig
        .map(([key, itemConfig]) => {
          const color = itemConfig.theme?.[theme as "light" | "dark"] ?? itemConfig.color
          return color ? `  --color-${key}: ${color};` : null
        })
        .filter(Boolean)
        .join("\n")
      return `${prefix} [data-chart=${id}] {\n${vars}\n}\n`
    })
    .join("\n")

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

