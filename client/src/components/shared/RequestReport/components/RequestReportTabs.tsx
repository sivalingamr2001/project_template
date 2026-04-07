import { useCallback, type MouseEvent } from "react"
import type { RequestReportTabId } from "../types"

const tabs: Array<{ id: RequestReportTabId; label: string }> = [
  { id: "details", label: "Request Details" },
  { id: "policy", label: "Data Policies" },
  { id: "itdept", label: "IT Dept. Use" },
]

export function RequestReportTabs(props: {
  tab: RequestReportTabId
  onTabChange: (tab: RequestReportTabId) => void
}) {
  const { tab, onTabChange } = props

  const handleTabClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const next = event.currentTarget.value as RequestReportTabId
      onTabChange(next)
    },
    [onTabChange]
  )

  return (
    <div className="flex border-b border-border">
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          value={item.id}
          onClick={handleTabClick}
          className={`flex-1 px-4 py-3 text-[11px] font-semibold tracking-widest uppercase transition-all ${
            tab === item.id
              ? "border-b-2 border-primary bg-card/50 text-foreground"
              : "text-muted-foreground hover:bg-card/30 hover:text-foreground"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

